

export default function Dashboard() {
    return (
        <div className="p-4">
            <h1 className="text-3xl font-serif text-primary mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-6 rounded-2xl">
                    <h2 className="text-xl font-bold mb-2">My Status</h2>
                    <p className="text-secondary">You are currently offline.</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl">
                    <h2 className="text-xl font-bold mb-2">Recent Matches</h2>
                    <p className="text-secondary">No matches yet.</p>
                </div>
            </div>
        </div>
    );
}
