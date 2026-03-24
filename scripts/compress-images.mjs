import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const SUPPORTED = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

async function findImages(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...await findImages(fullPath));
        } else if (SUPPORTED.includes(extname(entry.name))) {
            files.push(fullPath);
        }
    }
    return files;
}

async function compressImage(inputPath, outputPath, maxWidth, quality) {
    await mkdir(dirname(outputPath), { recursive: true });
    await sharp(inputPath)
        .rotate()  // EXIF Orientation 자동 보정
        .resize(maxWidth, null, { withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true })
        .toFile(outputPath);
}

async function processDir(srcDir, thumbDir, fullDir) {
    const images = await findImages(srcDir);
    let totalOriginal = 0;
    let totalThumb = 0;
    let totalFull = 0;

    for (const imgPath of images) {
        const rel = imgPath.slice(srcDir.length);
        const base = rel.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/, '.jpg');

        const thumbOut = thumbDir + base;
        const fullOut = fullDir + base;

        const origStat = await stat(imgPath);
        totalOriginal += origStat.size;

        // 섬네일: 최대 800px 너비, 75% 품질
        await compressImage(imgPath, thumbOut, 800, 75);
        const thumbStat = await stat(thumbOut);
        totalThumb += thumbStat.size;

        // 모달 원본: 최대 1800px 너비, 85% 품질
        await compressImage(imgPath, fullOut, 1800, 85);
        const fullStat = await stat(fullOut);
        totalFull += fullStat.size;

        console.log(`✓ ${rel.padEnd(50)} ${(origStat.size/1024/1024).toFixed(1)}MB → thumb:${(thumbStat.size/1024).toFixed(0)}KB / full:${(fullStat.size/1024).toFixed(0)}KB`);
    }

    return { totalOriginal, totalThumb, totalFull, count: images.length };
}

console.log('=== 이미지 압축 시작 ===\n');

const results2 = await processDir(
    join(publicDir, 'img2'),
    join(publicDir, 'img2-thumb'),
    join(publicDir, 'img2-full')
);

console.log('\n');

const results3 = await processDir(
    join(publicDir, 'img3'),
    join(publicDir, 'img3-thumb'),
    join(publicDir, 'img3-full')
);

const total = {
    orig: results2.totalOriginal + results3.totalOriginal,
    thumb: results2.totalThumb + results3.totalThumb,
    full: results2.totalFull + results3.totalFull,
    count: results2.count + results3.count,
};

console.log('\n=== 결과 요약 ===');
console.log(`처리한 파일: ${total.count}개`);
console.log(`원본 총 용량: ${(total.orig/1024/1024).toFixed(1)}MB`);
console.log(`섬네일 총 용량: ${(total.thumb/1024/1024).toFixed(1)}MB (${((total.thumb/total.orig)*100).toFixed(1)}%)`);
console.log(`풀사이즈 총 용량: ${(total.full/1024/1024).toFixed(1)}MB (${((total.full/total.orig)*100).toFixed(1)}%)`);
