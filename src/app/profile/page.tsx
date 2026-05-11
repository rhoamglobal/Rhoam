export default function ProfilePage() {
    return (
      <div className="min-h-screen pb-32 px-6 pt-10 bg-[#f9fafb]">
        <h1 className="text-2xl font-bold text-rhoam-primary mb-8">
          Profile
        </h1>
  
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-full bg-rhoam-primary/20 flex items-center justify-center text-2xl font-bold text-rhoam-primary">
            U
          </div>
          <div>
            <p className="font-semibold text-lg">Rhoam User</p>
            <p className="text-gray-500 text-sm">user@email.com</p>
          </div>
        </div>
  
        {/* Settings */}
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl shadow-sm">Edit Profile</div>
          <div className="p-4 bg-white rounded-xl shadow-sm">Saved Preferences</div>
          <div className="p-4 bg-white rounded-xl shadow-sm">Support</div>
          <div className="p-4 bg-white rounded-xl shadow-sm text-red-500">
            Logout
          </div>
        </div>
      </div>
    );
  }