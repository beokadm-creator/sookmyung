import { useState } from 'react';
import Layout from '../components/Layout';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { LazyImage } from '../components/ui/LazyImage';
import { ChevronDown, ChevronUp, Trophy, User, Image as ImageIcon, ExternalLink, History, GraduationCap, Play, Megaphone, Award } from 'lucide-react';

// 숙명인상 수상자 데이터 (2004년부터)
interface AwardWinner {
    name: string;
    department: string;
    graduationYear: string;
    award: string;
    photo?: string;
}

interface YearData {
    year: string;
    winners: AwardWinner[];
    groupPhoto?: string;
}

// 숙명 헤리티지 수상자 인터페이스
interface HeritageWinner {
    name: string;
    department: string;
    graduationYear: string;
    photo?: string;
}

interface HeritageYearData {
    year: string;
    winners: HeritageWinner[];
    groupPhoto?: string;
}

// 이미지 경로 헬퍼: 섬네일/풀사이즈 경로 변환
function toThumbPath(src: string): string {
    return src
        .replace('/img2/', '/img2-thumb/')
        .replace('/img3/', '/img3-thumb/')
        .replace(/\.(JPG|PNG)$/, '.jpg');
}
function toFullPath(src: string): string {
    return src
        .replace('/img2/', '/img2-full/')
        .replace('/img3/', '/img3-full/')
        .replace(/\.(JPG|PNG)$/, '.jpg');
}

// 자료 링크 데이터
const materials = [
    {
        title: '숙명여자대학교\n공식 홈페이지',
        description: '숙명여자대학교 공식 홈페이지',
        icon: GraduationCap,
        link: 'https://www.sookmyung.ac.kr',
        color: 'blue',
    },
    {
        title: '숙명여대 역사관',
        description: '숙명여자대학교의 역사와 전통을 느낄 수 있는 역사관',
        icon: History,
        link: 'https://heritagehall.sookmyung.ac.kr/',
        color: 'blue',
    },
    {
        title: '창학120주년 홈페이지',
        description: '숙명여자대학교 120주년 기념 공식 홈페이지',
        icon: GraduationCap,
        link: 'https://120th.sookmyung.ac.kr/SMU-120th/index.do',
        color: 'gold',
    },
    {
        title: '창학120주년 로고 영상',
        description: '숙명의 정신을 담은 120주년 로고 영상',
        icon: Play,
        link: 'https://www.youtube.com/watch?v=gsNwgi5z2gY',
        color: 'red',
    },
    {
        title: '창학120주년 홍보 영상',
        description: '숙명여자대학교 공식 홍보 영상',
        icon: Megaphone,
        link: 'https://www.youtube.com/watch?v=GZFZxoryV0Y',
        color: 'purple',
    },
    {
        title: '창학120주년\n브랜드 영상',
        description: '숙명여자대학교 브랜드 영상 - 유튜브에서 시청하기',
        icon: Play,
        link: 'https://www.youtube.com/watch?v=UH0QcNP1qxc&t=23s',
        color: 'green',
    },
];

// 2013년 ~ 2025년 데이터
const alumniData: YearData[] = [
    {
        year: '2025년',
        groupPhoto: '/img2/2025년/2025년.jpg',
        winners: [
            { name: '이경은', department: '중문과', graduationYear: '1980년', award: '아름다운 숙명인상', photo: '/img2/2025년/2025년 이경은.JPG' },
            { name: '고희경', department: '경영학과', graduationYear: '1993년', award: '아름다운 숙명인상', photo: '/img2/2025년/2025년 고희경.JPG' },
            { name: '권병진', department: '법학과', graduationYear: '1996년', award: '아름다운 숙명인상' },
            { name: '피윤정', department: '법학과', graduationYear: '1997년', award: '아름다운 숙명인상', photo: '/img2/2025년/2025년 피윤정.JPG' },
            { name: '진선미', department: '법학과', graduationYear: '2005년', award: '아름다운 숙명인상', photo: '/img2/2025년/2025년 진선미.JPG' },
            { name: '양나래', department: '경제학과', graduationYear: '2013년', award: '아름다운 숙명인상', photo: '/img2/2025년/2025년 양나래.JPG' },
        ],
    },
    {
        year: '2024년',
        groupPhoto: '/img2/2024년/2024년.jpg',
        winners: [
            { name: '강란기', department: '식품영양학과', graduationYear: '1979년', award: '아름다운 숙명인상', photo: '/img2/2024년/2024년 강란기.jpg' },
            { name: '최보경', department: '약학과', graduationYear: '1983년', award: '아름다운 숙명인상', photo: '/img2/2024년/2024년 최보경.jpg' },
            { name: '한순영', department: '약학과', graduationYear: '1983년', award: '아름다운 숙명인상', photo: '/img2/2024년/2024년 한순영.jpg' },
            { name: '이민선', department: '약학과', graduationYear: '1986년', award: '아름다운 숙명인상', photo: '/img2/2024년/2024년 이민선.jpg' },
            { name: '임청화', department: '성악과', graduationYear: '1987년', award: '아름다운 숙명인상', photo: '/img2/2024년/2024년 임청화.jpg' },
            { name: '김민정', department: '체육교육과', graduationYear: '1992년', award: '아름다운 숙명인상', photo: '/img2/2024년/2024년 김민정.jpg' },
        ],
    },
    {
        year: '2023년',
        groupPhoto: '/img2/2023년/2023년 숙명인상.JPG',
        winners: [
            { name: '권영희', department: '약학학과', graduationYear: '1982년', award: '아름다운 숙명인상', photo: '/img2/2023년/2023년 권영희.JPG' },
            { name: '정경실', department: '행정학과', graduationYear: '1995년', award: '아름다운 숙명인상', photo: '/img2/2023년/2023년 정경실.JPG' },
            { name: '남인숙', department: '국문과', graduationYear: '1997년', award: '아름다운 숙명인상', photo: '/img2/2023년/2023년 남인숙.JPG' },
            { name: '김경희', department: '작곡과', graduationYear: '1981년', award: '숙명 교수상', photo: '/img2/2023년/2023년 김경희.JPG' },
            { name: '이숙희', department: '영문과', graduationYear: '1985년', award: '숙명 교수상', photo: '/img2/2023년/2023년 이숙희.JPG' },
            { name: '문시연', department: '불문과', graduationYear: '1988년', award: '숙명 교수상', photo: '/img2/2023년/2023년 문시연.JPG' },
        ],
    },
    {
        year: '2022년',
        groupPhoto: '/img2/2022년/2022년.jpg',
        winners: [
            { name: '한성숙', department: '영문과', graduationYear: '1989년', award: '숙명 CEO상', photo: '/img2/2022년/2022년 한성숙.jpg' },
            { name: '안윤정', department: '생물학과', graduationYear: '1992년', award: '아름다운 숙명인상', photo: '/img2/2022년/2022년 안윤정.jpg' },
            { name: '안윤경', department: '공예과', graduationYear: '1997년', award: '아름다운 숙명인상', photo: '/img2/2022년/2022년 안윤경.jpg' },
        ],
    },
    {
        year: '2019년',
        groupPhoto: '/img2/2019년/2019년.jpg',
        winners: [
            { name: '강선영', department: '행정학과', graduationYear: '1989년', award: '올해의 숙명인상', photo: '/img2/2019년/2019년 강선영.JPG' },
            { name: '정형숙', department: '약학과', graduationYear: '1965년', award: '공로상', photo: '/img2/2019년/2019년 정형숙.JPG' },
            { name: '박성희', department: '경제학과', graduationYear: '1985년', award: '숙명 CEO상', photo: '/img2/2019년/2019년 박성희.JPG' },
            { name: '배은지', department: '언론정보학과', graduationYear: '2013년', award: '아름다운 숙명인상', photo: '/img2/2019년/2019년 배은지.JPG' },
        ],
    },
    {
        year: '2018년',
        groupPhoto: '/img2/2018년/2018년.jpg',
        winners: [
            { name: '정순옥', department: '화학공학과', graduationYear: '1973년', award: '올해의 숙명인상', photo: '/img2/2018년/2018년 정순옥.jpg' },
            { name: '김수민', department: '환경디자인학과', graduationYear: '2011년', award: '아름다운 숙명인상', photo: '/img2/2018년/2018년 김수민.jpg' },
            { name: '김복희', department: '생물학과', graduationYear: '1979년', award: '공로상' },
            { name: '박미경', department: '의류학과', graduationYear: '1982년', award: '공로상' },
        ],
    },
    {
        year: '2017년',
        groupPhoto: '/img2/2017년/2017년.jpg',
        winners: [
            { name: '김경희', department: '체육교육과', graduationYear: '1983년', award: '아름다운 숙명인상', photo: '/img2/2017년/2017년 김경희.jpg' },
            { name: '동을원', department: '약학과', graduationYear: '1976년', award: '숙명 CEO상', photo: '/img2/2017년/2017년 동을원.jpg' },
            { name: '신상희', department: '법학과', graduationYear: '1991년', award: '공로상', photo: '/img2/2017년/2017년 신상희.jpg' },
        ],
    },
    {
        year: '2016년 1월',
        groupPhoto: '/img2/2016년 1월.jpg',
        winners: [
            { name: '김순례', department: '제약학과', graduationYear: '1978년', award: '올해의 숙명인상' },
            { name: '이익선', department: '아동복지학부', graduationYear: '1991년', award: '아름다운 숙명인상' },
            { name: '김수민', department: '디자인학부', graduationYear: '2011년', award: '숙명 CEO상' },
            { name: '김윤아', department: '디자인학부', graduationYear: '2012년', award: '숙명 CEO상' },
            { name: '김희진', department: '디자인학부', graduationYear: '2012년', award: '숙명 CEO상' },
            { name: '정춘희', department: '영문과', graduationYear: '1966년', award: '공로상' },
            { name: '문일경', department: '생물미화학과', graduationYear: '1968년', award: '공로상' },
            { name: '조선혜', department: '제약학과', graduationYear: '1977년', award: '공로상' },
        ],
    },
    {
        year: '2016년 12월',
        winners: [
            { name: '박인비', department: '국제관계대학원수료', graduationYear: '정보 없음', award: '올해의 숙명인상', photo: '/img2/2016년 12월/2016년 박인비.PNG' },
            { name: '차윤선', department: '경제학과', graduationYear: '1989년', award: '아름다운 숙명인상', photo: '/img2/2016년 12월/2016년 차윤선.PNG' },
            { name: '박성희', department: '무역학과', graduationYear: '1992년', award: '숙명 CEO상', photo: '/img2/2016년 12월/2016년 박성희.PNG' },
            { name: '이인복', department: '국문과', graduationYear: '1960년', award: '숙명 NGO상', photo: '/img2/2016년 12월/2016년 이인복.PNG' },
            { name: '김말숙', department: '약학과', graduationYear: '1985년', award: '수상자', photo: '/img2/2016년 12월/2016년 김말숙.PNG' },
        ],
    },
    {
        year: '2014년',
        groupPhoto: '/img2/2014년.jpg',
        winners: [
            { name: '조선혜', department: '제약학과', graduationYear: '1977년', award: '올해의 숙명인상' },
            { name: '강화자', department: '성악과', graduationYear: '1968년', award: '올해의 숙명인상' },
            { name: '정미선', department: '소프트웨어역학부', graduationYear: '2003년', award: '아름다운 숙명인상' },
            { name: '배경자', department: '국문과', graduationYear: '1965년', award: '숙명 NGO상' },
            { name: '정영자', department: '약학과', graduationYear: '1965년', award: '공로상' },
        ],
    },
    {
        year: '2013년',
        groupPhoto: '/img2/2013년.jpg',
        winners: [
            { name: '류지영', department: '생물미화학과', graduationYear: '1972년', award: '올해의 숙명인상' },
            { name: '박성희', department: '경제학과', graduationYear: '1985년', award: '숙명 CEO상' },
            { name: '박기은', department: '체육교육과', graduationYear: '2013년', award: '아름다운 숙명인상' },
        ],
    },
    {
        year: '2012년',
        winners: [
            { name: '이지숙', department: '영문과', graduationYear: '1966년', award: '숙명 NGO상' },
            { name: '김경민', department: '교육학과', graduationYear: '2010년', award: '아름다운 숙명인상' },
            { name: '박세리', department: '정행학과', graduationYear: '2007년', award: '올해의 숙명인상' },
        ]
    },
    {
        year: '2011년',
        winners: [
            { name: '조선혜', department: '제약학과', graduationYear: '1977년', award: '숙명 CEO상' },
            { name: '권순인', department: '물리학과', graduationYear: '1976년', award: '숙명 NGO상' },
            { name: '김혜성', department: '경영학과', graduationYear: '1978년', award: '올해의 숙명인상' },
            { name: '배현진', department: '정방학과', graduationYear: '2007년', award: '올해의 숙명인상' },
            { name: '김귀자', department: '교육학과', graduationYear: '1964년', award: '특별공로상' },
            { name: '김풍애', department: '가정학과', graduationYear: '1964년', award: '특별공로상' },
        ]
    },
    {
        year: '2010년',
        winners: [
            { name: '이상신', department: '영문과', graduationYear: '1963년', award: '올해의 숙명인상' },
        ]
    },
    {
        year: '2008년',
        winners: [
            { name: '목은균', department: '사학과', graduationYear: '정보 없음', award: '특별공로상' },
            { name: '김태자', department: '국문과', graduationYear: '1965년', award: '특별공로상' },
            { name: '정희선', department: '약학과', graduationYear: '1978년', award: '올해의 숙명인상' },
            { name: '신수진', department: '정외과', graduationYear: '1991년', award: '올해의 숙명인상' },
        ]
    },
    {
        year: '2006년',
        winners: [
            { name: '김옥렬', department: '영문과', graduationYear: '1953년', award: '역대 동문회장 감사패' },
            { name: '정규선', department: '약학과', graduationYear: '1958년', award: '역대 동문회장 감사패' },
            { name: '이옥순', department: '가정과', graduationYear: '1941년', award: '역대 동문회장 감사패' },
            { name: '이귀명', department: '가정과', graduationYear: '1942년', award: '역대 동문회장 감사패' },
            { name: '김명희', department: '국문과', graduationYear: '1952년', award: '역대 동문회장 감사패' },
            { name: '원효경', department: '경제과', graduationYear: '1958년', award: '역대 동문회장 감사패' },
            { name: '이상숙', department: '가정과', graduationYear: '1961년', award: '역대 동문회장 감사패' },
            { name: '문계', department: '국문과', graduationYear: '1965년', award: '역대 동문회장 감사패' },
            { name: '정정애', department: '사학과', graduationYear: '1966년', award: '역대 동문회장 감사패' },
            { name: '정춘희', department: '영문과', graduationYear: '1966년', award: '역대 동문회장 감사패' },
            { name: '정영자', department: '약학과', graduationYear: '1965년', award: '특별공로상' },
            { name: '문일경', department: '생물미화학과', graduationYear: '1968년', award: '특별공로상' },
            { name: '이인복', department: '국문과', graduationYear: '1960년', award: '올해의 숙명인상' },
            { name: '이금희', department: '정보 없음', graduationYear: '정보 없음', award: '올해의 숙명인상' },
        ]
    },
    {
        year: '2005년',
        winners: [
            { name: '이명자', department: '교육과', graduationYear: '1968년', award: '숙명가족상' },
            { name: '이명희', department: '교육과', graduationYear: '1970년', award: '숙명가족상' },
            { name: '이명순', department: '응용미생물학과', graduationYear: '1976년', award: '숙명가족상' },
            { name: '이명옥', department: '의류학과', graduationYear: '1978년', award: '숙명가족상' },
            { name: '백민경', department: '중문과', graduationYear: '2004년', award: '숙명가족상' },
        ]
    },
    {
        year: '2004년',
        winners: [
            { name: '이경숙', department: '정외과', graduationYear: '1965년', award: '숙명인상' },
            { name: '박동은', department: '영문과', graduationYear: '1958년', award: '올해의 숙명인상' },
            { name: '윤용숙', department: '국문과', graduationYear: '1959년', award: '숙명 NGO상' },
            { name: '한상은', department: '국문과', graduationYear: '1949년', award: '숙명 CEO상' },
            { name: '정남연', department: '경제과', graduationYear: '1959년', award: '숙명인상' },
            { name: '홍신자', department: '영문과', graduationYear: '1963년', award: '숙명문화예술인상' },
            { name: '박찬숙', department: '국문과', graduationYear: '1968년', award: '숙명 언론인상' },
            { name: '김양숙', department: '학부형', graduationYear: '-', award: '특별공로상' },
            { name: '석경숙', department: '교육과', graduationYear: '1972년', award: '특별공로상' },
        ]
    },
];

// 숙명 헤리티지 데이터
const heritageData: HeritageYearData[] = [
    {
        year: '2025년',
        groupPhoto: '/img3/2025년/2025년 12월.JPG',
        winners: [
            { name: '박정은', department: '약학', graduationYear: '64', photo: '/img3/2025년/2025년 7월 박정은.jpg' },
            { name: '김선실', department: '중문', graduationYear: '79' },
            { name: '이미화', department: '아복', graduationYear: '83', photo: '/img3/2025년/2025년 12월 이미화.JPG' },
            { name: '최보경', department: '약학', graduationYear: '83', photo: '/img3/2025년/2025년 12월 최보경.JPG' },
            { name: '황학연', department: '식영', graduationYear: '85', photo: '/img3/2025년/2023년 7월 황학연.jpg' },
            { name: '손영화', department: '법학', graduationYear: '96', photo: '/img3/2025년/2025년 12월 손영화.JPG' },
        ],
    },
    {
        year: '2024년',
        groupPhoto: '/img3/2024년.jpg',
        winners: [
            { name: '박영인', department: '사학', graduationYear: '68' },
            { name: '이명숙', department: '가관', graduationYear: '71' },
            { name: '손경숙', department: '영문', graduationYear: '83', photo: '/img3/2025년/2025년 7월 손경숙.jpg' },
            { name: '이숙희', department: '영문', graduationYear: '85' },
        ],
    },
    {
        year: '2023년',
        groupPhoto: '/img3/2023년.jpg',
        winners: [
            { name: '홍승완', department: '영문', graduationYear: '54' },
            { name: '김계선', department: '가정', graduationYear: '54' },
            { name: '이정숙', department: '가정', graduationYear: '57' },
            { name: '정창명', department: '영문', graduationYear: '58' },
            { name: '황젬마', department: '가정', graduationYear: '59' },
            { name: '윤용숙', department: '국문', graduationYear: '59' },
            { name: '이인복', department: '국문', graduationYear: '60' },
            { name: '양원희', department: '기악', graduationYear: '61' },
            { name: '서영자', department: '영문', graduationYear: '63' },
            { name: '김광숙', department: '약학', graduationYear: '63' },
            { name: '이복자', department: '국문', graduationYear: '63' },
            { name: '박청자', department: '가정', graduationYear: '63' },
            { name: '김귀자', department: '교육', graduationYear: '64' },
            { name: '김풍애', department: '가정', graduationYear: '64' },
            { name: '이희성', department: '약학', graduationYear: '64' },
            { name: '정영자', department: '약학', graduationYear: '65' },
            { name: '원재희', department: '가정', graduationYear: '65' },
            { name: '허일숙', department: '경영', graduationYear: '65' },
            { name: '정춘희', department: '영문', graduationYear: '66' },
            { name: '강옥천', department: '사학', graduationYear: '66' },
            { name: '정정애', department: '사학', graduationYear: '66' },
            { name: '문일경', department: '생미', graduationYear: '68' },
            { name: '조강순', department: '약학', graduationYear: '68' },
            { name: '윤선자', department: '약학', graduationYear: '69' },
            { name: '이영자', department: '경영', graduationYear: '69' },
            { name: '이선애', department: '생미', graduationYear: '69' },
            { name: '황현숙', department: '정외', graduationYear: '70' },
            { name: '이광희', department: '정외', graduationYear: '71' },
            { name: '류지영', department: '생미', graduationYear: '72' },
            { name: '윤명숙', department: '성악', graduationYear: '72' },
            { name: '정순옥', department: '화학', graduationYear: '73' },
            { name: '주경희', department: '정외', graduationYear: '73' },
            { name: '김영아', department: '체육', graduationYear: '76' },
            { name: '황선혜', department: '영문', graduationYear: '76' },
            { name: '동을원', department: '약학', graduationYear: '76' },
            { name: '조선혜', department: '제약', graduationYear: '77' },
            { name: '박원경', department: '중문', graduationYear: '78' },
            { name: '김순례', department: '제약', graduationYear: '78' },
            { name: '김영혜', department: '수학', graduationYear: '79' },
            { name: '김복희', department: '생물', graduationYear: '79' },
            { name: '강정애', department: '경영', graduationYear: '80' },
            { name: '김종희', department: '제약', graduationYear: '80' },
            { name: '김명림', department: '무역', graduationYear: '80' },
            { name: '김옥정', department: '경제', graduationYear: '81' },
            { name: '장지연', department: '식영', graduationYear: '81' },
            { name: '신순균', department: '불문', graduationYear: '81' },
            { name: '이영숙', department: '도서', graduationYear: '81' },
            { name: '임미영', department: '교육', graduationYear: '82' },
            { name: '박미경', department: '의류', graduationYear: '82' },
            { name: '김경희', department: '체교', graduationYear: '83' },
            { name: '박소영', department: '정외', graduationYear: '83' },
            { name: '강애진', department: '영문', graduationYear: '84' },
            { name: '강영해', department: '아복', graduationYear: '84' },
            { name: '장윤금', department: '도서', graduationYear: '84' },
            { name: '이미희', department: '가관', graduationYear: '87' },
            { name: '이애형', department: '제약', graduationYear: '88' },
            { name: '문시연', department: '불문', graduationYear: '88' },
            { name: '황여정', department: '영문', graduationYear: '04' },
            { name: '고은정', department: '경영', graduationYear: '05' },
        ],
    },
];

export default function Materials() {
    const [expandedYear, setExpandedYear] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [selectedWinner, setSelectedWinner] = useState<AwardWinner | null>(null);
    const [activeTab, setActiveTab] = useState<'award' | 'heritage'>('award');

    const handleYearClick = (year: string) => {
        setExpandedYear(expandedYear === year ? null : year);
    };

    const handleWinnerClick = (winner: AwardWinner, photoUrl: string | undefined) => {
        if (photoUrl) {
            setSelectedWinner(winner);
            setSelectedPhoto(toFullPath(photoUrl));
        }
    };

    const closePhotoModal = () => {
        setSelectedPhoto(null);
        setSelectedWinner(null);
    };

    return (
        <Layout>
            {/* Hero Section */}
            <Section variant="gradient" padding="md" className="text-white">
                <Container>
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            창학 120주년 자료
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-6">
                            숙명여자대학교 120주년 기념 다양한 자료들을 만나보세요
                        </p>
                    </div>
                </Container>
            </Section>

            {/* Materials Grid */}
            <Section padding="md">
                <Container>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-sookmyung-blue-900 mb-4">
                            120주년 관련 자료
                        </h2>
                        <p className="text-gray-600 text-lg">
                            숙명여자대학교 120주년 기념 공식 자료 및 링크 모음
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.map((material, index) => {
                            const Icon = material.icon;
                            const colorClasses: Record<string, string> = {
                                blue: 'bg-blue-100 text-blue-600',
                                gold: 'bg-yellow-100 text-yellow-600',
                                red: 'bg-red-100 text-red-600',
                                purple: 'bg-purple-100 text-purple-600',
                                green: 'bg-green-100 text-green-600',
                            };

                            return (
                                <Card
                                    key={index}
                                    variant="elevated"
                                    hover
                                    className="p-6"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[material.color] || colorClasses.blue}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-sookmyung-blue-900 mb-2 whitespace-pre-line">
                                                {material.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-4">
                                                {material.description}
                                            </p>
                                            <a
                                                href={material.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                                            >
                                                바로가기
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </Container>
            </Section>

            {/* 수상자 명단 섹션 */}
            <Section variant="secondary" padding="md">
                <Container>
                    <div>
                        {/* 탭 네비게이션 */}
                        <div className="flex justify-center mb-8">
                            <div className="inline-flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => { setActiveTab('award'); setExpandedYear(null); }}
                                    className={`
                                        px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2
                                        ${activeTab === 'award'
                                            ? 'bg-white text-sookmyung-blue-600 shadow-md'
                                            : 'text-gray-600 hover:text-gray-900'}
                                    `}
                                >
                                    <Trophy className="w-5 h-5" />
                                    숙명인상
                                </button>
                                <button
                                    onClick={() => { setActiveTab('heritage'); setExpandedYear(null); }}
                                    className={`
                                        px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2
                                        ${activeTab === 'heritage'
                                            ? 'bg-white text-sookmyung-blue-600 shadow-md'
                                            : 'text-gray-600 hover:text-gray-900'}
                                    `}
                                >
                                    <Award className="w-5 h-5" />
                                    숙명 헤리티지
                                </button>
                            </div>
                        </div>

                        {/* 숙명인상 탭 */}
                        {activeTab === 'award' && (
                            <>
                                {/* 숙명인상 소개 */}
                                <Card variant="elevated" className="p-6 mb-8 bg-gradient-to-r from-yellow-50 to-orange-50">
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Trophy className="w-8 h-8 text-yellow-600" />
                                        </div>
                                        <div className="text-center md:text-left">
                                            <h3 className="text-xl font-bold text-sookmyung-blue-900 mb-2">
                                                숙명인상 소개
                                            </h3>
                                            <p className="text-gray-600">
                                                숙명인상은 숙명여자대학교 총동문회에서 수여하는 최고의 영예로,
                                                모학교본(母校本顔)의 정신을 계승하고 사회에 기여한 뛰어난 동문에게 수여합니다.
                                                2004년 첫 수여 이후 매년 이어온 전통으로, 숙명의 자랑스러운 동문들을 기립니다.
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                {/* 연도별 수상자 목록 */}
                                <div className="space-y-4">
                                    {alumniData.map((yearData) => (
                                        <div
                                            key={yearData.year}
                                            className="bg-white rounded-xl shadow-md overflow-hidden"
                                        >
                                            {/* 연도 헤더 */}
                                            <button
                                                onClick={() => handleYearClick(yearData.year)}
                                                className="w-full px-6 py-4 flex items-center justify-between bg-sookmyung-blue-600 text-white hover:bg-sookmyung-blue-700 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-bold">{yearData.year}</span>
                                                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                                                        {yearData.winners.length}명
                                                    </span>
                                                </div>
                                                {expandedYear === yearData.year ? (
                                                    <ChevronUp className="w-6 h-6" />
                                                ) : (
                                                    <ChevronDown className="w-6 h-6" />
                                                )}
                                            </button>

                                            {/* 수상자 목록 (펼쳐졌을 때) */}
                                            {expandedYear === yearData.year && (
                                                <div className="p-6">
                                                    {/* 단체사진 */}
                                                    {yearData.groupPhoto && (
                                                        <div className="mb-6">
                                                            <h4 className="text-lg font-semibold text-sookmyung-blue-900 mb-3 flex items-center gap-2">
                                                                <ImageIcon className="w-5 h-5" />
                                                                단체사진
                                                            </h4>
                                                            <div className="relative group rounded-lg overflow-hidden">
                                                                <div className="h-48 md:h-64 cursor-pointer" onClick={() => setSelectedPhoto(toFullPath(yearData.groupPhoto!))}>
                                                                    <LazyImage
                                                                        src={toThumbPath(yearData.groupPhoto)}
                                                                        alt={`${yearData.year} 단체사진`}
                                                                        className="w-full h-full"
                                                                    />
                                                                </div>
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                                                                    <span className="opacity-0 group-hover:opacity-100 text-white font-medium bg-black/50 px-4 py-2 rounded-lg transition-opacity">
                                                                        클릭하여 확대
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 개별 수상자 */}
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-sookmyung-blue-900 mb-3 flex items-center gap-2">
                                                            <User className="w-5 h-5" />
                                                            수상자 명단
                                                        </h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {yearData.winners.map((winner, index) => (
                                                                <div
                                                                    key={index}
                                                                    onClick={() => winner.photo ? handleWinnerClick(winner, winner.photo) : undefined}
                                                                    className={`
                                                                        p-4 rounded-lg border-2 transition-all cursor-pointer
                                                                        ${winner.photo
                                                                            ? 'border-gray-200 hover:border-sookmyung-blue-400 hover:shadow-md'
                                                                            : 'border-gray-200 bg-gray-50 cursor-default'}
                                                                    `}
                                                                >
                                                                    {/* 사진 영역 */}
                                                                    <div className="mb-3 h-32">
                                                                        {winner.photo ? (
                                                                            <div className="relative group rounded-lg overflow-hidden h-full cursor-pointer" onClick={() => winner.photo ? handleWinnerClick(winner, winner.photo) : undefined}>
                                                                                <LazyImage
                                                                                    src={toThumbPath(winner.photo)}
                                                                                    alt={winner.name}
                                                                                    className="w-full h-full"
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-full h-32 bg-gray-100 rounded-md flex flex-col items-center justify-center border border-gray-200">
                                                                                <User className="w-12 h-12 text-gray-400 mb-1" />
                                                                                <span className="text-xs text-gray-400">사진 준비중</span>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* 수상자 정보 */}
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs font-medium px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                                                                                {winner.award}
                                                                            </span>
                                                                        </div>
                                                                        <h5 className="font-bold text-lg text-gray-900">
                                                                            {winner.name}
                                                                        </h5>
                                                                        <p className="text-sm text-gray-600">
                                                                            {winner.department}
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">
                                                                            {winner.graduationYear} 졸업
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* 숙명 헤리티지 탭 */}
                        {activeTab === 'heritage' && (
                            <>
                                {/* 숙명 헤리티지 소개 */}
                                <Card variant="elevated" className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Award className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <div className="text-center md:text-left">
                                            <h3 className="text-xl font-bold text-sookmyung-blue-900 mb-2">
                                                숙명 헤리티지 소개
                                            </h3>
                                            <p className="text-gray-600">
                                                숙명 헤리티지는 숙명의 정신을 계승하고 사회에 뛰어난 기여를 한 동문들에게 수여하는 영예로운 상입니다.
                                                역사와 전통을 간직하는 숙명의 자랑스러운 동문들을 기립니다.
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                {/* 연도별 헤리티지 목록 */}
                                <div className="space-y-4">
                                    {heritageData.map((yearData) => (
                                        <div
                                            key={yearData.year}
                                            className="bg-white rounded-xl shadow-md overflow-hidden"
                                        >
                                            {/* 연도 헤더 */}
                                            <button
                                                onClick={() => handleYearClick(yearData.year)}
                                                className="w-full px-6 py-4 flex items-center justify-between bg-sookmyung-blue-600 text-white hover:bg-sookmyung-blue-700 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-bold">{yearData.year}</span>
                                                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                                                        {yearData.winners.length}명
                                                    </span>
                                                </div>
                                                {expandedYear === yearData.year ? (
                                                    <ChevronUp className="w-6 h-6" />
                                                ) : (
                                                    <ChevronDown className="w-6 h-6" />
                                                )}
                                            </button>

                                            {/* 수상자 목록 (펼쳐졌을 때) */}
                                            {expandedYear === yearData.year && (
                                                <div className="p-6">
                                                    {/* 단체사진 */}
                                                    {yearData.groupPhoto && (
                                                        <div className="mb-6">
                                                            <h4 className="text-lg font-semibold text-sookmyung-blue-900 mb-3 flex items-center gap-2">
                                                                <ImageIcon className="w-5 h-5" />
                                                                단체사진
                                                            </h4>
                                                            <div className="relative group rounded-lg overflow-hidden">
                                                                <div className="h-48 md:h-64 cursor-pointer" onClick={() => setSelectedPhoto(toFullPath(yearData.groupPhoto!))}>
                                                                    <LazyImage
                                                                        src={toThumbPath(yearData.groupPhoto!)}
                                                                        alt={`${yearData.year} 단체사진`}
                                                                        className="w-full h-full"
                                                                    />
                                                                </div>
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                                                                    <span className="opacity-0 group-hover:opacity-100 text-white font-medium bg-black/50 px-4 py-2 rounded-lg transition-opacity">
                                                                        클릭하여 확대
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 개별 수상자 */}
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-sookmyung-blue-900 mb-3 flex items-center gap-2">
                                                            <User className="w-5 h-5" />
                                                            수상자 명단
                                                        </h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {yearData.winners.map((winner, index) => (
                                                                <div
                                                                    key={index}
                                                                    onClick={() => winner.photo ? handleWinnerClick(winner as AwardWinner, winner.photo) : undefined}
                                                                    className={`
                                                                        p-4 rounded-lg border-2 transition-all cursor-pointer
                                                                        ${winner.photo
                                                                            ? 'border-gray-200 hover:border-sookmyung-blue-400 hover:shadow-md'
                                                                            : 'border-gray-200 bg-gray-50 cursor-default'}
                                                                    `}
                                                                >
                                                                    {/* 사진 영역 */}
                                                                    <div className="mb-3 h-32">
                                                                        {winner.photo ? (
                                                                            <div className="relative group rounded-lg overflow-hidden h-full cursor-pointer" onClick={() => winner.photo ? handleWinnerClick(winner as AwardWinner, winner.photo) : undefined}>
                                                                                <LazyImage
                                                                                    src={toThumbPath(winner.photo)}
                                                                                    alt={winner.name}
                                                                                    className="w-full h-full"
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-full h-32 bg-gray-100 rounded-md flex flex-col items-center justify-center border border-gray-200">
                                                                                <User className="w-12 h-12 text-gray-400 mb-1" />
                                                                                <span className="text-xs text-gray-400">사진 준비중</span>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* 수상자 정보 */}
                                                                    <div className="space-y-1">
                                                                        <h5 className="font-bold text-lg text-gray-900">
                                                                            {winner.name}
                                                                        </h5>
                                                                        <p className="text-sm text-gray-600">
                                                                            {winner.department}
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">
                                                                            {winner.graduationYear}학번
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </Container>
            </Section>

            {/* 사진 모달 */}
            <Modal
                isOpen={!!selectedPhoto}
                onClose={closePhotoModal}
                title={selectedWinner ? `${selectedWinner.name} - ${selectedWinner.award}` : '사진 보기'}
                size="xl"
            >
                {selectedPhoto && (
                    <div className="space-y-4">
                        <img
                            src={selectedPhoto}
                            alt={selectedWinner?.name || '사진'}
                            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                        />
                        {selectedWinner && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-bold text-lg text-gray-900">{selectedWinner.name}</h4>
                                <p className="text-gray-600">{selectedWinner.department}</p>
                                <p className="text-gray-500 text-sm">{selectedWinner.graduationYear} 졸업</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </Layout>
    );
}
