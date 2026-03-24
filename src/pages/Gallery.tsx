import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Link } from 'react-router-dom';
import { Image as ImageIcon, Video, X } from 'lucide-react';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { GalleryItem } from '../types';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  title: string;
  thumbnail: string;
  src?: string;
  youtubeId?: string;
  description?: string;
}

const fallbackGalleryItems: MediaItem[] = [
  {
    id: '1',
    type: 'photo',
    title: '초기 캠퍼스 모습',
    thumbnail: 'bg-gradient-to-br from-blue-100 to-blue-200',
    description: '1906년 숙명여자대학교의 초기 캠퍼스 모습',
  },
  {
    id: '2',
    type: 'photo',
    title: '100주년 기념식',
    thumbnail: 'bg-gradient-to-br from-gold-100 to-gold-200',
    description: '2006년 숙명 창학 100주년 기념식',
  },
  {
    id: '3',
    type: 'photo',
    title: '졸업식 사진',
    thumbnail: 'bg-gradient-to-br from-blue-50 to-blue-100',
    description: '1960년대 졸업식 모습',
  },
  {
    id: '4',
    type: 'photo',
    title: '도서관',
    thumbnail: 'bg-gradient-to-br from-gray-100 to-gray-200',
    description: '중앙도서관 건립 기념사진',
  },
  {
    id: '5',
    type: 'photo',
    title: '동문회 모임',
    thumbnail: 'bg-gradient-to-br from-blue-100 to-blue-200',
    description: '동문들의 축하 모임',
  },
  {
    id: '6',
    type: 'photo',
    title: '캠퍼스 봄 풍경',
    thumbnail: 'bg-gradient-to-br from-pink-100 to-pink-200',
    description: '봄의 숙명 캠퍼스',
  },
  {
    id: '7',
    type: 'video',
    title: '120주년 비전 선포 영상',
    thumbnail: 'bg-gradient-to-br from-blue-900 to-blue-800',
    youtubeId: 'SALwRCKxZEc',
    description: '120주년 기념 비전 선포식 영상',
  },
  {
    id: '8',
    type: 'video',
    title: '숙명 120년 역사 다큐멘터리',
    thumbnail: 'bg-gradient-to-br from-blue-800 to-blue-700',
    youtubeId: 'example',
    description: '120년의 역사를 담은 다큐멘터리',
  },
  {
    id: '9',
    type: 'video',
    title: '동문 축하 메시지',
    thumbnail: 'bg-gradient-to-br from-gold-500 to-gold-600',
    youtubeId: 'example',
    description: '동문들의 축하 메시지 영상',
  },
];

export default function Gallery() {
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<MediaItem[]>(fallbackGalleryItems);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const getGalleryItemsFn = httpsCallable(functions, 'getGalleryItems');
        const result = await getGalleryItemsFn({});
        const galleryData = (result.data as { items?: GalleryItem[] }).items || [];

        if (galleryData.length > 0) {
          const mappedItems: MediaItem[] = galleryData.map((item) => ({
            id: item.id,
            type: item.type,
            title: item.title,
            thumbnail: item.thumbnailUrl || 'bg-gradient-to-br from-gray-100 to-gray-200',
            src: item.mediaUrl,
            youtubeId: item.videoId,
            description: item.description,
          }));
          setGalleryItems(mappedItems);
        }
      } catch (error) {
        console.warn('Failed to load gallery from Firebase, using fallback:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, []);

  const filteredItems = galleryItems.filter(
    (item) => filter === 'all' || item.type === filter
  );

  if (loading) {
    return (
      <Layout>
        <Section padding="xl">
          <Container>
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </Container>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <Section variant="gradient" padding="lg">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              120주년 갤러리
            </h1>
            <p className="text-xl text-blue-100">
              숙명의 빛나는 순간들을 이미지와 영상으로 만나보세요
            </p>
          </div>
        </Container>
      </Section>

      {/* Filter Tabs */}
      <Section padding="md">
        <Container>
          <div className="flex justify-center gap-4 mb-8">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-sookmyung-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => setFilter('photo')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                filter === 'photo'
                  ? 'bg-sookmyung-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              사진
            </button>
            <button
              type="button"
              onClick={() => setFilter('video')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                filter === 'video'
                  ? 'bg-sookmyung-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Video className="w-4 h-4" />
              영상
            </button>
          </div>
        </Container>
      </Section>

      {/* Gallery Grid */}
      <Section padding="lg">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <Card
                key={item.id}
                hover
                className="group cursor-pointer overflow-hidden"
                onClick={() => setSelectedItem(item)}
              >
                <div className="aspect-video rounded-lg mb-4 flex items-center justify-center relative overflow-hidden bg-gray-100">
                  {item.type === 'photo' ? (
                    item.src ? (
                      <img
                        src={item.src}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`w-full h-full ${item.thumbnail} flex items-center justify-center`}>
                        <ImageIcon className="w-12 h-12 text-sookmyung-blue-400" />
                      </div>
                    )
                  ) : (
                    <>
                      {item.youtubeId ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                            <Video className="w-8 h-8 text-sookmyung-blue-600" />
                          </div>
                        </div>
                      ) : (
                        <Video className="w-12 h-12 text-gray-400" />
                      )}
                    </>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2 text-sookmyung-blue-900">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">표시할 항목이 없습니다.</p>
            </div>
          )}
        </Container>
      </Section>

      {/* Back Button */}
      <Section padding="md">
        <Container>
          <div className="text-center">
            <Link to="/">
              <Button variant="primary" size="lg">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Lightbox Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          size="xl"
        >
          <div className="bg-white rounded-2xl overflow-hidden">
            {/* Thumbnail/Preview Area */}
            <div className="aspect-video relative bg-gray-900">
              {selectedItem.type === 'photo' ? (
                selectedItem.src ? (
                  <img
                    src={selectedItem.src}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className={`w-full h-full ${selectedItem.thumbnail} flex items-center justify-center`}>
                    <ImageIcon className="w-16 h-16 text-white/50" />
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {selectedItem.youtubeId && (
                    <div className="w-full h-full">
                      {selectedItem.youtubeId.length === 11 ? (
                        // YouTube
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${selectedItem.youtubeId}`}
                          title={selectedItem.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      ) : (
                        // Vimeo
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://player.vimeo.com/video/${selectedItem.youtubeId}`}
                          title={selectedItem.title}
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-sookmyung-blue-900">
                    {selectedItem.title}
                  </h3>
                  <p className="text-gray-600">{selectedItem.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Type Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedItem.type === 'photo'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {selectedItem.type === 'photo' ? '📷 사진' : '🎬 영상'}
                </span>
              </div>

              {/* Actions */}
              {selectedItem.type === 'photo' && selectedItem.src && (
                <div className="flex gap-4">
                  <a
                    href={selectedItem.src}
                    download
                    className="flex-1 text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    다운로드
                  </a>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
