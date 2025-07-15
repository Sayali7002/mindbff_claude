'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';

const blogs = [
  {
    id: 1,
    title: "Mindfulness Practices from Ancient Indian Traditions",
    description: "Explore meditation techniques rooted in yoga and Ayurveda for mental well-being.",
    readTime: "7 min read",
    category: "Mindfulness",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3",
    url: "/blogs/1",
    type: "internal",
    content: [
      { type: 'p', text: "Mindfulness has been a core part of Indian spiritual traditions for thousands of years. Practices such as meditation, pranayama (breathwork), and yoga are rooted in ancient texts like the Vedas and Upanishads." },
      { type: 'h3', text: "The Roots of Mindfulness in India" },
      { type: 'p', text: "Ancient Indian scriptures like the Bhagavad Gita and Patanjali's Yoga Sutras describe mindfulness as a way to cultivate self-awareness and inner peace. These teachings emphasize living in the present moment and observing thoughts without judgment." },
      { type: 'p', text: "Meditation and breathwork (pranayama) were developed as tools to help practitioners achieve a calm, focused mind. These practices have been passed down through generations and are still widely used today." },
      { type: 'h3', text: "Modern Science Meets Ancient Wisdom" },
      { type: 'p', text: "Recent scientific studies have shown that mindfulness practices can reduce stress, improve emotional regulation, and enhance overall well-being. Techniques like mindful breathing and body scans are now recommended by mental health professionals worldwide." },
      { type: 'h3', text: "How to Start a Mindfulness Practice" },
      { type: 'p', text: "Begin with a simple breathing meditation: Sit comfortably, close your eyes, and focus on your breath. Notice each inhale and exhale. If your mind wanders, gently bring it back to your breath. Start with 5 minutes a day and gradually increase the duration." },
      { type: 'p', text: "You can also explore guided meditations, yoga, or mindful walking. The key is consistency and a non-judgmental attitude toward yourself." },
      { type: 'h3', text: "Conclusion" },
      { type: 'p', text: "Mindfulness is a timeless practice that bridges ancient wisdom and modern science. By incorporating mindfulness into your daily routine, you can cultivate greater peace, clarity, and resilience in your life." }
    ]
  },
  {
    id: 2,
    title: "Managing Stress in Modern Indian Life",
    description: "Practical strategies to balance work, family expectations and personal well-being.",
    readTime: "8 min read",
    category: "Stress Management",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3",
    url: "/blogs/2",
    type: "internal",
    content: [
      { type: 'p', text: "Modern life in India can be hectic, with pressures from work, family, and society. It's important to recognize stress and take steps to manage it." },
      { type: 'h3', text: "Understanding Stress Triggers" },
      { type: 'p', text: "Common sources of stress include job demands, family responsibilities, academic pressure, and social expectations. Identifying your main stressors is the first step toward managing them effectively." },
      { type: 'h3', text: "Effective Stress Management Strategies" },
      { type: 'p', text: "1. Set Boundaries: Learn to say no and prioritize your well-being.\n2. Practice Mindfulness: Use meditation or deep breathing to calm your mind.\n3. Stay Active: Regular exercise helps release tension and boosts mood.\n4. Connect with Others: Share your feelings with friends or family members." },
      { type: 'h3', text: "Balancing Work and Personal Life" },
      { type: 'p', text: "Create a daily routine that includes time for work, relaxation, and hobbies. Avoid multitasking and give yourself permission to take breaks. Remember, rest is productive too." },
      { type: 'h3', text: "When to Seek Help" },
      { type: 'p', text: "If stress becomes overwhelming or persistent, consider reaching out to a mental health professional. Support is available, and seeking help is a sign of strength." },
      { type: 'h3', text: "Conclusion" },
      { type: 'p', text: "Managing stress is an ongoing process. By adopting healthy habits and seeking support when needed, you can lead a more balanced and fulfilling life." }
    ]
  },
  {
    id: 3,
    title: "Breaking Mental Health Stigma in Indian Communities",
    description: "How to talk about mental health with family and overcome cultural barriers.",
    readTime: "9 min read",
    category: "Awareness",
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-4.0.3",
    url: "/blogs/3",
    type: "internal",
    content: [
      { type: 'p', text: "Mental health stigma remains a challenge in many Indian communities. It can prevent people from seeking help and support." },
      { type: 'h3', text: "Why Does Stigma Exist?" },
      { type: 'p', text: "Stigma often arises from lack of awareness, cultural beliefs, and fear of judgment. Many people worry about being labeled as 'weak' or 'unstable' if they talk about mental health." },
      { type: 'h3', text: "How to Start the Conversation" },
      { type: 'p', text: "1. Share Personal Stories: Talking about your own experiences can help others feel less alone.\n2. Use Simple Language: Avoid medical jargon and explain things in relatable terms.\n3. Listen Without Judgment: Offer empathy and support, not solutions." },
      { type: 'h3', text: "Role of Education and Media" },
      { type: 'p', text: "Educational campaigns, films, and social media can play a powerful role in changing attitudes. Encourage open discussions at home, schools, and workplaces." },
      { type: 'h3', text: "Supporting Someone Facing Stigma" },
      { type: 'p', text: "If someone you know is struggling, listen to them, validate their feelings, and encourage them to seek professional help if needed." },
      { type: 'h3', text: "Conclusion" },
      { type: 'p', text: "Breaking the stigma around mental health requires collective effort. By fostering understanding and compassion, we can create a more supportive community for everyone." }
    ]
  },
  {
    id: 4,
    title: "Workplace Burnout: Signs, Prevention, and Recovery",
    description: "Recognize burnout symptoms and learn effective strategies to prevent and recover from workplace exhaustion.",
    readTime: "10 min read",
    category: "Professional Health",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3",
    url: "/blogs/4",
    type: "internal",
    content: [
      { type: 'p', text: "Burnout is a state of emotional, physical, and mental exhaustion caused by prolonged stress. Common signs include fatigue, irritability, and reduced performance." },
      { type: 'h3', text: "Recognizing the Signs of Burnout" },
      { type: 'p', text: "Symptoms of burnout include chronic tiredness, lack of motivation, difficulty concentrating, and feeling detached from work. Physical symptoms may include headaches or sleep disturbances." },
      { type: 'h3', text: "Preventing Burnout" },
      { type: 'p', text: "1. Set Boundaries: Separate work from personal time.\n2. Take Breaks: Short breaks during the day can boost productivity.\n3. Prioritize Self-Care: Eat well, exercise, and get enough sleep." },
      { type: 'h3', text: "Recovering from Burnout" },
      { type: 'p', text: "If you are already experiencing burnout, consider talking to your manager, taking time off, or seeking professional support. Recovery is a gradual process that involves rest, reflection, and lifestyle changes." },
      { type: 'h3', text: "Conclusion" },
      { type: 'p', text: "Burnout is common but manageable. By recognizing the signs early and taking proactive steps, you can protect your well-being and thrive at work." }
    ]
  },
  {
    id: 5,
    title: "Imposter Syndrome in the Workplace",
    description: "Understanding and overcoming the feeling that you don't deserve your success.",
    readTime: "8 min read",
    category: "Career Growth",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3",
    url: "/blogs/5",
    type: "internal",
    content: [
      { type: 'p', text: "Imposter syndrome is the persistent feeling that you are not as competent as others think you are, despite evidence of your success. Many high-achievers experience it at some point in their careers." },
      { type: 'h3', text: "Common Signs of Imposter Syndrome" },
      { type: 'p', text: "- Doubting your abilities\n- Attributing success to luck\n- Fear of being 'found out'\n- Overworking to prove yourself" },
      { type: 'h3', text: "How to Overcome Imposter Syndrome" },
      { type: 'p', text: "1. Acknowledge Your Achievements: Keep a record of your successes.\n2. Talk About Your Feelings: Share with trusted colleagues or mentors.\n3. Challenge Negative Self-Talk: Replace self-doubt with positive affirmations." },
      { type: 'h3', text: "Seeking Support" },
      { type: 'p', text: "Remember, you are not alone. Many successful people have felt like imposters. Seeking support from peers or professionals can help you gain perspective and confidence." },
      { type: 'h3', text: "Conclusion" },
      { type: 'p', text: "Imposter syndrome is a common experience, but it doesn't define your worth. Embrace your achievements and continue to grow with confidence." }
    ]
  },
  {
    id: 6,
    title: "Building Resilience in High-Pressure Environments",
    description: "Develop mental toughness and emotional resilience to thrive in demanding professional settings.",
    readTime: "9 min read",
    category: "Resilience",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3",
    url: "/blogs/6",
    type: "internal",
    content: [
      { type: 'p', text: "Resilience is the ability to bounce back from setbacks and adapt to challenges. It's a skill that can be developed over time." },
      { type: 'h3', text: "Why Resilience Matters" },
      { type: 'p', text: "In high-pressure environments, resilience helps you manage stress, maintain focus, and recover from failures. It is essential for long-term success and well-being." },
      { type: 'h3', text: "Ways to Build Resilience" },
      { type: 'p', text: "1. Maintain a Positive Outlook: Focus on solutions, not problems.\n2. Nurture Supportive Relationships: Connect with people who uplift you.\n3. Practice Self-Care: Prioritize sleep, nutrition, and relaxation." },
      { type: 'h3', text: "Overcoming Setbacks" },
      { type: 'p', text: "Everyone faces setbacks. The key is to learn from them, adapt, and keep moving forward. Celebrate small wins and be kind to yourself during tough times." },
      { type: 'h3', text: "Conclusion" },
      { type: 'p', text: "Building resilience is a journey. With practice and support, you can thrive even in the most demanding environments." }
    ]
  },
  {
    id: 7,
    title: "How I Overcame Burnout: My Personal Journey",
    description: "A candid story about facing burnout and finding balance again.",
    readTime: "7 min read",
    category: "Personal Story",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?ixlib=rb-4.0.3",
    url: "/blogs/7",
    type: "internal",
    content: [
      { type: 'p', text: "A year ago, I found myself exhausted, unmotivated, and disconnected from my work. I realized I was experiencing burnout." },
      { type: 'h3', text: "Recognizing the Problem" },
      { type: 'p', text: "At first, I ignored the signs—fatigue, irritability, and lack of enthusiasm. But as my performance declined, I knew something had to change." },
      { type: 'h3', text: "Seeking Support and Making Changes" },
      { type: 'p', text: "With encouragement from friends and family, I took a break and reassessed my priorities. I started incorporating self-care into my routine and set boundaries at work." },
      { type: 'h3', text: "Lessons Learned" },
      { type: 'p', text: "Burnout taught me the importance of balance and asking for help. Recovery was gradual, but I emerged stronger and more self-aware." },
      { type: 'h3', text: "Conclusion" },
      { type: 'p', text: "If you are struggling with burnout, know that recovery is possible. Reach out for help, and give yourself permission to rest." }
    ]
  }
];

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params.id;
  const blog = blogs.find(b => String(b.id) === String(blogId));

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
          <button
            onClick={() => router.push('/blogs')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full flex items-center"
          >
            <span className="material-icons mr-2">arrow_back</span>
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
      <div className="sticky top-5 z-20 shadow-sm">

        <div className="flex items-center mb-8 justify-between">
          <button
            onClick={() => router.push('/blogs')}
            className="flex items-center text-blue-500 hover:text-blue-700 focus:outline-none"
            aria-label="Back to blogs"
          >
            <span className="material-icons text-2xl mr-2">arrow_back</span>
            <span className="font-semibold text-lg hidden sm:inline">Back</span>
          </button>
          <h1 className="flex-1 text-2xl font-bold text-gray-900 text-center">Blog</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-blue-500 hover:text-blue-700 focus:outline-none ml-4"
            aria-label="Go to dashboard"
          >
            <span className="material-icons text-2xl mr-2">home</span>
            <span className="font-semibold text-lg hidden sm:inline">Home</span>
          </button>
        </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-56 object-cover rounded-xl mb-6"
          />
          <div className="flex items-center justify-between w-full mb-4">
            <span className="text-xs font-semibold text-pink-600 bg-pink-100 rounded-full px-2 py-0.5">{blog.category}</span>
            <span className="text-xs text-gray-400">{blog.readTime}</span>
          </div>
          <h2 className="font-bold text-2xl text-gray-900 mb-4 text-center w-full">{blog.title}</h2>
          <p className="text-gray-700 text-base leading-relaxed w-full text-center mb-4">{blog.description}</p>
          {blog.content && blog.content.map((item, idx) => (
            item.type === 'h3' ? (
              <h3 key={idx} className="font-bold text-xl text-gray-900 mb-2">{item.text}</h3>
            ) : (
              <p key={idx} className="text-gray-700 text-base leading-relaxed w-full mb-3 text-left">{item.text}</p>
            )
          ))}
        </div>
      </div>
    </div>
  );
} 