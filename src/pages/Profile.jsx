export default function Profile() {
    return (
        <div className="p-4">
            <h1 className="text-3xl font-serif text-primary mb-6">Edit Profile</h1>
            <form className="glass-panel p-6 rounded-2xl space-y-4">
                <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Full Name</label>
                    <input type="text" className="w-full p-3 rounded-xl border border-pink-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400" placeholder="John Doe" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Department</label>
                    <select className="w-full p-3 rounded-xl border border-pink-100 bg-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400">
                        <option>Computer Science</option>
                        <option>Engineering</option>
                        <option>Business</option>
                        <option>Arts</option>
                    </select>
                </div>
                <button type="submit" className="w-full btn-primary py-3 rounded-xl font-semibold mt-4">
                    Save Profile
                </button>
            </form>
        </div>
    );
}
