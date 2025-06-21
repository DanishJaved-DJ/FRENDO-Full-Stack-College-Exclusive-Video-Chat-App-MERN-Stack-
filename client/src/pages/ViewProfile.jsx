import Header from '../components/Header';
import { use, useEffect, useState } from "react";
import Api from '../serverApi/Api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import Context from '../context/Context.jsx';
import { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function ViewProfile() {
  const [profileDetails, setProfileDetails] = useState(null);
  const [loading, setLoading] = useState(true);
    const context = useContext(Context);
  const user = useSelector((state) => state?.user?.user);
  const navigate = useNavigate();
 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(Api.profile.url, {
          method: Api.profile.method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setProfileDetails(data);
      } catch (error) {
        toast.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="loader"></div>
          <style>{`
            .loader {
              border: 8px solid #f3f3f3;
              border-top: 8px solid #262626;
              border-radius: 50%;
              width: 60px;
              height: 60px;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg);}
              100% { transform: rotate(360deg);}
            }
          `}</style>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Instagram-like profile field row
  const FieldRow = ({ label, value = "N/A" }) => (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 justify-center items-center my-2">
      <h1 className="text-sm sm:text-base font-semibold text-gray-900 w-full sm:w-1/4 text-center sm:text-right">{label}</h1>
      <div className="bg-transparent text-gray-800 rounded-lg p-2 sm:p-3 w-full sm:w-7/12 border-b border-gray-200">
        <h2 className="text-base font-normal text-left break-words">{value}</h2>
      </div>
    </div>
  );

  return (
    <div className="bg-white w-full min-h-screen relative font-sans">
      <Header />
      <div>
        <Link
          className="text-blue-500 hover:text-blue-700 text-base p-2 rounded transition fixed top-15 left-4 z-10 bg-white border border-gray-200 shadow"
          to="/home"
        >
          Back
        </Link>
        <div className="flex flex-col items-center mt-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-pink-500 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center overflow-hidden shadow-lg">
              {profileDetails?.data?.avatarUrl ? (
                <img
                  src={profileDetails.data.avatarUrl}
                  alt="Avatar"
                  className="w-28 h-28 object-cover rounded-full"
                />
              ) : (
                <svg className="w-28 h-28 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
                </svg>
              )}
            </div>
            <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 border border-gray-300">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.414 2.586a2 2 0 00-2.828 0l-9.9 9.9a2 2 0 00-.516.878l-1.2 4.2a1 1 0 001.212 1.212l4.2-1.2a2 2 0 00.878-.516l9.9-9.9a2 2 0 000-2.828zM15.586 4L16 4.414a1 1 0 010 1.414l-1.293 1.293-2.828-2.828L13.172 2.586a1 1 0 011.414 0z"/>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mt-4 text-gray-900">{profileDetails?.data?.username}</h1>
          <div className="flex gap-8 mt-4 text-center">
            <div>
              <span className="block text-lg font-semibold text-gray-900">{user.friends.length || 0}</span>
              <span className="block text-xs text-gray-500">Friends</span>
            </div>
          </div>
        </div>
        <div className="max-w-xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow mt-8 border border-gray-200">
          <FieldRow label="Email:" value={profileDetails?.data?.email} />
          <FieldRow label="Date of Birth:" value={formatDate(profileDetails?.data?.dob || "N/A")} />
          <FieldRow label="Roll No.:" value={profileDetails?.data?.regNo || "N/A"} />
          <FieldRow label="College:" value={profileDetails?.data?.collegeName || "N/A"} />
          <FieldRow
            label="Hobbies:"
            value={Array.isArray(profileDetails?.data?.hobbies) ? profileDetails.data.hobbies.join(", ") : "N/A"}
          />
          <FieldRow label="About:" value={profileDetails?.data?.description || "N/A"} />
        </div>
      </div>
    </div>
  );
}

export default ViewProfile;
