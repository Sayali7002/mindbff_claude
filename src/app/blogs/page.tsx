'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const blogs = [
  {
    id: 1,
    title: 'Mindfulness Practices from Ancient Indian Traditions',
    description: 'Explore meditation techniques rooted in yoga and Ayurveda for mental well-being.',
    readTime: '5 min read',
    category: 'Mindfulness',
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3',
    url: '/blogs/1',
    type: 'internal',
  },
  {
    id: 2,
    title: 'Managing Stress in Modern Indian Life',
    description: 'Practical strategies to balance work, family expectations and personal well-being.',
    readTime: '6 min read',
    category: 'Stress Management',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3',
    url: '/blogs/2',
    type: 'internal',
  },
  {
    id: 3,
    title: 'Breaking Mental Health Stigma in Indian Communities',
    description: 'How to talk about mental health with family and overcome cultural barriers.',
    readTime: '7 min read',
    category: 'Awareness',
    image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-4.0.3',
    url: '/blogs/3',
    type: 'internal',
  },
  {
    id: 4,
    title: 'Workplace Burnout: Signs, Prevention, and Recovery',
    description: 'Recognize burnout symptoms and learn effective strategies to prevent and recover from workplace exhaustion.',
    readTime: '8 min read',
    category: 'Professional Health',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3',
    url: '/blogs/4',
    type: 'internal',
  },
  {
    id: 5,
    title: 'Imposter Syndrome in the Workplace',
    description: 'Understanding and overcoming the feeling that you don\'t deserve your success.',
    readTime: '6 min read',
    category: 'Career Growth',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3',
    url: '/blogs/5',
    type: 'internal',
  },
  {
    id: 6,
    title: 'Building Resilience in High-Pressure Environments',
    description: 'Develop mental toughness and emotional resilience to thrive in demanding professional settings.',
    readTime: '7 min read',
    category: 'Resilience',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3',
    url: '/blogs/6',
    type: 'internal',
  },
  {
    id: 7,
    title: 'How I Overcame Burnout: My Personal Journey',
    description: 'A candid story about facing burnout and finding balance again.',
    readTime: '4 min read',
    category: 'Personal Story',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?ixlib=rb-4.0.3',
    url: '/blogs/7',
    type: 'internal',
  },
];

export default function BlogsPage() {
  const router = useRouter();

  const handleCardClick = (blog: any) => {
    router.push(blog.url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-10 px-4">
     
      <div className="max-w-5xl mx-auto">
      <div className="sticky top-5 z-20 shadow-sm">

        <div className=" flex items-center mb-8">
          <h1 className=" flex-1 text-3xl font-bold text-gray-900 text-center">Resources Hub</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className=" flex items-center text-blue-500 hover:text-blue-700 focus:outline-none ml-4"
            aria-label="Go to dashboard"
          >
            <span className="material-icons text-2xl mr-2">home</span>
            <span className="font-semibold text-lg hidden sm:inline">Home</span>
          </button>
        </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              tabIndex={0}
              role="button"
              className="bg-white rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col overflow-hidden group focus:ring-2 focus:ring-blue-300 outline-none"
              onClick={() => handleCardClick(blog)}
              onKeyDown={e => { if (e.key === 'Enter') handleCardClick(blog); }}
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-pink-600 bg-pink-100 rounded-full px-2 py-0.5">{blog.category}</span>
                  <span className="text-xs text-gray-400">{blog.readTime}</span>
                </div>
                <h2 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">{blog.title}</h2>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{blog.description}</p>
                <span className="mt-auto text-blue-500 font-medium flex items-center text-sm">
                  Read Article
                  <span className="material-icons ml-1 text-base">article</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 