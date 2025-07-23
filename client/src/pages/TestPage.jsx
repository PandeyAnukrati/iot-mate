import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ToastTester from '../components/ToastTester';

const TestPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Component Testing Page</h1>
        
        <div className="grid grid-cols-1 gap-8">
          <section>
            <ToastTester />
          </section>
          
          {/* Add more test components here as needed */}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TestPage;