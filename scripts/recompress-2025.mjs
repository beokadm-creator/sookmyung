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

// 2025년 폴더만 재처리
const dirs = [
    { src: join(publicDir, 'img2', '2025년'), thumb: join(publicDir, 'img2-thumb', '2025년'), full: join(publicDir, 'img2-full', '2025년') },
    { src: join(publicDir, 'img3', '2025년'), thumb: join(publicDir, 'img3-thumb', '2025년'), full: join(publicDir, 'img3-full', '2025년') },
];

for (const { src, thumb, full } of dirs) {
    const images = await findImages(src).catch(() => []);
    for (const imgPath of images) {
        const filename = imgPath.slice(src.length).replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/, '.jpg');
        const thumbOut = thumb + filename;
        const fullOut = full + filename;

        await compressImage(imgPath, thumbOut, 800, 75);
        await compressImage(imgPath, fullOut, 1800, 85);

        const origStat = await stat(imgPath);
        const thumbStat = await stat(thumbOut);
        console.log(`✓ ${filename.padEnd(40)} ${(origStat.size/1024/1024).toFixed(1)}MB → thumb:${(thumbStat.size/1024).toFixed(0)}KB`);
    }
}

console.log('\n완료. 2025년 이미지 EXIF 회전 보정 적용됨.');
