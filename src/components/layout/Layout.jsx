import Navbar from './Navbar';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen font-sans relative overflow-hidden">
            {/* Heartlink Background — Deep burgundy/wine gradient (STRICT match) */}
            <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
                {/* Base wine gradient */}
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, #1a0a10 0%, #140810 20%, #0d0d0d 50%, #0a0a0f 100%)' }} />

                {/* Top-center warm burgundy glow */}
                <div className="absolute -top-[250px] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full opacity-35"
                    style={{ background: 'radial-gradient(ellipse, rgba(140,20,50,0.5) 0%, rgba(80,10,30,0.3) 35%, transparent 65%)' }} />

                {/* Right side subtle warm bleed */}
                <div className="absolute top-[20%] right-[-100px] w-[500px] h-[500px] rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle, rgba(255,59,92,0.2) 0%, transparent 60%)' }} />

                {/* Bottom left accent */}
                <div className="absolute bottom-[-100px] left-[-50px] w-[400px] h-[400px] rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, rgba(180,30,60,0.25) 0%, transparent 55%)' }} />

                {/* Noise texture */}
                <div className="absolute inset-0 opacity-[0.015]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")` }} />
            </div>

            <Navbar />
            <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
                {children}
            </main>
        </div>
    );
}
