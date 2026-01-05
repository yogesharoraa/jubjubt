"use client";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import useApiPost from "../hooks/postData";
type AdItem = {
  id: string;
  title?: string;
  description?: string;
  sub_description?: string;
  uploader_type: "admin" | "user";
  uploader_name?: string;
  type: "image" | "video";
  media_url?: string;
  position?: string;
  priority?: string;
  target_url?: string;
  created_at?: string;
  end_date?: string;
  status?: string;
};

export default function UserAdsManager() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { postData } = useApiPost();
  const limit = 10;

  // Fetch all user ads
  const fetchAds = async () => {
    setLoading(true);
    try {
      const response = await postData("/api/ads/fetch-ads", { page, limit });
      if (response.success) {
        setAds(response.data.ads);
        setTotalPages(response.data.totalPages);
      } else {
        toast.error("Failed to fetch ads");
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast.error("Error fetching ads");
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log(postData);
    fetchAds();
  }, [page]);

  // Delete Ad
  const deleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    try {
      const response = await postData("/api/ads/delete-ad", { id });
      if (response.success) {
        toast.success("Ad deleted successfully");
        fetchAds();
      } else toast.error("Failed to delete ad");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting ad");
    }
  };

  // Create or Update Ad
  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (creating) return;
    setCreating(true);

    const fd = new FormData(e.currentTarget);
    const files = fd.get("files");

    if (files instanceof File && files.name) {
      const uploadRes = await postData("/api/ads/upload", fd, "multipart/form-data");
      if (uploadRes.success) {
        fd.append("media_url", uploadRes.path);
      } else {
        toast.error("File upload failed");
        setCreating(false);
        return;
      }
    }

    const endpoint = editingAd ? "/api/ads/update-ad" : "/api/ads/create-ad";
    if (editingAd) fd.append("id", editingAd.id);

    try {
      const response = await postData(endpoint, fd, "multipart/form-data");
      if (response.success) {
        toast.success(editingAd ? "Ad updated" : "Ad created");
        fetchAds();
        e.currentTarget.reset();
        setEditingAd(null);
      } else toast.error("Failed to save ad");
    } catch (err) {
      console.error(err);
      toast.error("Error saving ad");
    }
    setCreating(false);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">🎯 User Ads Manager</h2>

      {/* Create / Edit Ad Form */}
      <form onSubmit={onSubmit} className="p-4 border rounded-lg space-y-3 bg-white">
        <div className="grid md:grid-cols-2 gap-3">
          <input
            name="title"
            placeholder="Title"
            defaultValue={editingAd?.title}
            className="border rounded p-2 w-full"
            required
          />
          <input
            name="target_url"
            placeholder="Target URL"
            defaultValue={editingAd?.target_url}
            className="border rounded p-2 w-full"
          />
          <input
            name="position"
            placeholder="Position"
            defaultValue={editingAd?.position}
            className="border rounded p-2 w-full"
          />
          <input
            name="priority"
            placeholder="Priority"
            defaultValue={editingAd?.priority}
            className="border rounded p-2 w-full"
          />
          <select
            name="type"
            defaultValue={editingAd?.type || "image"}
            className="border rounded p-2 w-full"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <input
            name="files"
            type="file"
            accept="image/*,video/*"
            className="border rounded p-2 w-full"
          />
        </div>
        <textarea
          name="description"
          placeholder="Description"
          defaultValue={editingAd?.description}
          className="border rounded p-2 w-full"
        />
        <textarea
          name="sub_description"
          placeholder="Sub Description"
          defaultValue={editingAd?.sub_description}
          className="border rounded p-2 w-full"
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {creating ? "Saving..." : editingAd ? "Update Ad" : "Create Ad"}
        </button>
        {editingAd && (
          <button
            type="button"
            className="ml-3 text-red-600"
            onClick={() => setEditingAd(null)}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Ads Table */}
      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Media</th>
              <th className="p-2 border">Action Button</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Position</th>
              <th className="p-2 border">Priority</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : ads.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No ads found
                </td>
              </tr>
            ) : (
              ads.map((ad, i) => (
                <tr key={ad.id}>
                  <td className="p-2 border text-center">{i + 1}</td>
                  <td className="p-2 border text-center">
                    {ad.type === "image" ? (
                      <img
                        src={ad.media_url}
                        alt="Ad"
                        className="h-12 w-20 object-cover rounded border"
                      />
                    ) : (
                      <video
                        src={ad.media_url}
                        className="h-12 w-20 rounded border object-cover"
                        controls
                      />
                    )}
                  </td>
                  <td className="p-2 border">{ad.title}</td>
                  <td className="p-2 border">{ad.type}</td>
                  <td className="p-2 border">{ad.position}</td>
                  <td className="p-2 border">{ad.priority}</td>
                  <td className="p-2 border text-center space-x-2">
                    <button
                      className="text-blue-600"
                      onClick={() => setEditingAd(ad)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => deleteAd(ad.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-3">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
