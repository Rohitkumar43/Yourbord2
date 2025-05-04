import Image from "next/image";
import { Pencil, Share2, Users, Shapes, Github, Download, Twitter, Linkedin, Mail, Heart, Coffee, Star } from 'lucide-react';


import signUp from "./signup/page";
import Link from "next/link";
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shapes className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-primary-600">Yourboard</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <Link href="/rooms" className="text-gray-600 hover:text-primary-600 transition-colors">
              My Rooms
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">Signup
            </Link>
            <Link href="/signin" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">SignIn
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern opacity-10 bg-[size:20px_20px]"></div>
        <div className="absolute inset-0 bg-gradient-radial from-primary-100/50 to-transparent"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block animate-bounce mb-4">
              <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                ✨ New Features Available
              </span>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Yourboard collaboration
              <span className="text-primary-600"> made simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Create, collaborate, and share beautiful hand-drawn diagrams with your team in real-time
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center shadow-lg shadow-primary-500/20">
                <Pencil className="w-5 h-5 mr-2" />
                Start Drawing
              </button>
              <button className="px-8 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Download
              </button>
            </div>
            <div className="mt-12 flex justify-center items-center space-x-8">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&h=100&q=80"
                alt="Team collaboration"
                className="rounded-lg shadow-xl"
              />
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=200&h=100&q=80"
                alt="Whiteboard session"
                className="rounded-lg shadow-xl"
              />
              <img
                src="https://images.unsplash.com/photo-1531498860502-7c67cf02f657?auto=format&fit=crop&w=200&h=100&q=80"
                alt="Team meeting"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-primary-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Pencil className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Easy Drawing</h3>
              <p className="text-gray-600 leading-relaxed">
                Create diagrams naturally with our intuitive drawing tools and gestures. Perfect for both beginners and professionals.
              </p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Share2 className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Real-time Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">
                Work together with your team in real-time, no matter where they are. Share ideas instantly and iterate faster.
              </p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Team Friendly</h3>
              <p className="text-gray-600 leading-relaxed">
                Perfect for teams of all sizes, with powerful sharing and permission controls built right in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary-200 rounded-full opacity-50 blur-2xl"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary-300 rounded-full opacity-50 blur-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=2000&q=80"
                alt="Excalidraw Demo"
                className="rounded-2xl shadow-2xl relative z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shapes className="w-8 h-8 text-primary-400" />
                <span className="text-2xl font-bold text-primary-400">Excalidraw</span>
              </div>
              <p className="text-gray-400">
                Making collaboration beautiful and efficient
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Integrations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Enterprise</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Get in Touch</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Support Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                    <Coffee className="w-4 h-4 mr-2" />
                    Buy us a coffee
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Star on GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-4 md:mb-0">
              © 2024 Excalidraw. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
