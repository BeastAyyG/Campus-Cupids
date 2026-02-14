import Navbar from './Navbar';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen pb-20 md:pb-0 md:pt-20">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
