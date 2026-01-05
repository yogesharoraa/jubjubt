"use client";
import { useEffect, useState } from "react";
import useApiPost from "../hooks/postData";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

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
  createdAt?: string;
  deleted_at?: string | null; 
  status?: string;
  uploader_id :string;
};

export default function UserAdsManager() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [Updating, setUpdating] = useState(false);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const [EditshowModal , setEditshowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { postData } = useApiPost();
  const limit = 10;
  const token = Cookies.get("Reelboost_auth_token");
  function decodeToken(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

  // Fetch Ads
  const fetchAds = async () => {
    const decoded: any = token ? decodeToken(token) : null;
    const userId = decoded?.user_id;
    console.log('user',userId);
    setLoading(true);
    try {
      const response = await postData("/users/ads/fetch-ads", { page, limit ,userId});
      if (response.success) {
        setAds(response.data.ads);
        setTotalPages(response.data.totalPages);
      } else toast.error("Failed to fetch ads");
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast.error("Error fetching ads");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAds();
  }, [page]);

  // Delete Ad
  const deleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    try {
      const response = await postData("/users/ads/delete-ad", { id });
      if (response.status) {
        fetchAds();
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

  const formEl = e.currentTarget;
  const fd = new FormData(formEl);

  // 🔥 ACTION BUTTON → TITLE AUTO MAP (ADDED)
  const actionButton = fd.get("action_button") as string | null;
  const title = fd.get("title") as string | null;

  if (!title && actionButton) {
    const map: Record<string, string> = {
      stream_now: "Stream Now",
      book_now: "Book Now",
      learn_more: "Learn More",
      get_tickets: "Get Tickets",
      watch_now: "Watch Now",
      shop_now: "Shop Now",
      sign_up: "Sign Up",
    };

    fd.set("title", map[actionButton] || "Learn More");
  }

  const file = fd.get("files");
  let filePath = null;

  if (file instanceof File) {
    const fileFormData = new FormData();
    fileFormData.append("files", file);

    try {
      const uploadRes = await fetch(
        "http://3.225.161.94:3000/api/admin/ads/upload-file",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fileFormData, // No headers here!
        }
      );

      const data = await uploadRes.json();
      if (data.success) {
        filePath = "http://3.225.161.94:3000" + data.path;
        console.log("✅ File uploaded successfully:", filePath);
      } else {
        toast.error(data.message || "File upload failed");
        setCreating(false);
        return;
      }
    } catch (err) {
      console.error("❌ Upload failed:", err);
      toast.error("Upload failed");
      setCreating(false);
      return;
    }
  }

  const decoded: any = token ? decodeToken(token) : null;
  const userId = decoded?.user_id;
  fd.append("uploader_id", userId);

  // 2️⃣ Add uploaded file path to main form
  if (filePath) {
    fd.delete("media_url"); // remove raw file
    fd.append("media_url", filePath); // add uploaded path
  }

  // Map end date -> deleted_at for backend
  const endDate = (fd.get("end_date") as string) || "";
  if (endDate) {
    fd.append("created_at", new Date(endDate + "T00:00:00").toISOString());
    fd.append("deleted_at", new Date(endDate + "T00:00:00").toISOString());
  }

  // frequency removed globally — ensure you DON'T send any per-row frequency
  fd.delete("frequency");

  if (!fd.get("target_url")) {
    toast.error("Target Link is required");
    setCreating(false);
    return;
  }

  if (!fd.get("file") && !fd.get("media_url")) {
    toast.error("Please choose a file or provide media_url");
    setCreating(false);
    return;
  }

  const res = await postData("/users/ads/create", fd);

  setCreating(false);
  setShowModal(false);
  fetchAds();

  if (res?.success) {
    toast.success("Ad added");
    formEl.reset();
  } else {
    toast.error(res?.message || "Failed to add");
  }
};

  const onEditSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!editingAd) return;
    setUpdating(true);
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    fd.append("id", editingAd.id);
    const file = fd.get("files");
    let filePath = null;
    // ✅ Upload file only if valid
    if (file instanceof File && file.size > 0) {
      const fileFormData = new FormData();
      fileFormData.append("files", file);
      try {
        const uploadRes = await fetch("http://3.225.161.94:3000/api/admin/ads/upload-file", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fileFormData,
        });
        const data = await uploadRes.json();
        if (data.success) {
          filePath = "http://3.225.161.94:3000" + data.path;
          console.log("✅ File uploaded successfully:", filePath);
        } else {
          toast.error(data.message || "File upload failed");
          setUpdating(false);
          return;
        }
      } catch (err) {
        console.error("❌ Upload failed:", err);
        toast.error("Upload failed");
        setUpdating(false);
        return;
      }
    }
    // ✅ Add uploaded file path to main form
    if (filePath) {
      fd.delete("media_url"); // remove old file path
      fd.append("media_url", filePath); // replace with new path
    } else {
      // no new file selected — don’t send empty file
      if (file instanceof File && file.size === 0) fd.delete("files");
    }
    // 🗓 Map end date → deleted_at
    const endDate = (fd.get("end_date") as string) || "";
    if (endDate) {
      fd.append("deleted_at", new Date(endDate + "T00:00:00").toISOString());
    } else {
      fd.append("deleted_at", "");
    }
    // remove frequency always
    fd.delete("frequency");
    console.log("🧩 Edit FormData entries:");
    for (let [key, val] of fd.entries()) console.log(key, val);
    // 🚀 Update request
    const res = await postData("/users/ads/update", fd);
    setUpdating(false);
    setEditshowModal(false);
    if (res?.success) {
      toast.success("Ad updated");
      setEditingAd(null);
      //fetchList(pagination.current_page, pagination.records_per_page);
    } else {
      toast.error(res?.message || "Failed to update");
    }
    fetchAds();
  };
  return (
    <div className="p-6 space-y-6 text-black mt-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold">🎯 User Ads Manager</h2>
        <button
          onClick={() => {
            setEditingAd(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Ad
        </button>
      </div>

      {/* Ads Table */}
      <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="p-3 border">#</th>
              <th className="p-3 border">Media</th>
              <th className="p-3 border">Action Button</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Description</th>
              <th className="p-3 border">End Date</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
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
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="p-3 border text-center">{i + 1}</td>
                  <td className="p-3 border text-center">
                    {ad.type === "image" ? (
                      <img
                        src={ad.media_url}
                        alt="Ad"
                        className="h-14 w-24 object-cover rounded-md border"
                      />
                    ) : (
                      <video
                        src={ad.media_url}
                        className="h-14 w-24 rounded-md border object-cover"
                        controls
                      />
                    )}
                  </td>
                  <td className="p-3 border">{ad.title}</td>
                  <td className="p-3 border capitalize">{ad.type}</td>
                  <td className="p-3 border text-center">{ad.description}</td>
                  <td className="p-3 border text-center">{ad.deleted_at ? new Date(ad.deleted_at).toLocaleDateString() : "-"}</td>
                  <td className="p-3 border text-center space-x-3">
                    {/* <button
                      onClick={() => {
                        setEditingAd(ad);
                        setEditshowModal(true);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button> */}
                    <button
                      onClick={() => deleteAd(ad.id)}
                      className="text-red-600 hover:underline"
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
          className="px-4 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
  Page {page} / {ads.length === 0 ? 1 : totalPages}
</span>

     <button
  disabled={ads.length === 0 || page >= totalPages}
  onClick={() => {
    if (ads.length > 0 && page < totalPages) {
      setPage(page + 1);
    }
  }}
  className="px-4 py-1 border rounded disabled:opacity-50"
>
  Next
</button>

      </div>

      {/* Create/Edit Modal */}
     {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-gray-100 p-6 rounded-md w-[560px] max-h-[80vh] overflow-y-auto shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Add Advertisement</h2>

      <form onSubmit={onSubmit} encType="multipart/form-data">
        {/* Target URL */}
        <div className="mb-3">
          <input
            name="target_url"
            placeholder="Target Link (https://...)"
            required
            className="w-full h-10 bg-gray-300 rounded px-3"
          />
        </div>

        {/* Type */}
        <div className="mb-4">
     <select
  name="type"
  value={mediaType}
  onChange={(e) => setMediaType(e.target.value as "image" | "video")}
  className="w-full h-10 bg-gray-300 rounded px-3"
>
  <option value="image">Image</option>
  <option value="video">Video</option>
</select>

        </div>

        {/* Upload + Action Buttons */}
        <div className="flex gap-4 mb-4">
          {/* Upload */}
          <div className="flex-1">
            <label
              htmlFor="files"
              className="block bg-gray-300 px-4 py-3 rounded text-center cursor-pointer"
            >
              Upload Media
            </label>
           <input
  id="files"
  name="files"
  type="file"
  accept={mediaType === "image" ? "image/*" : "video/*"}
  className="hidden"
/>

          </div>

          {/* Action Buttons */}
          <div className="w-44">
            <p className="font-medium mb-2 text-sm">Action Buttons</p>
            <div className="flex flex-col gap-2 text-sm">
              {[
                ["stream_now", "Stream Now"],
                ["book_now", "Book Now"],
                ["learn_more", "Learn More"],
                ["get_tickets", "Get Tickets"],
                ["watch_now", "Watch Now"],
                ["shop_now", "Shop Now"],
                ["sign_up", "Sign Up"],
              ].map(([val, label]) => (
                <label key={val} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="action_button"
                    value={val}
                    defaultChecked={val === "learn_more"}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <textarea
          name="description"
          placeholder="Description (optional)"
          rows={2}
          className="w-full border rounded px-3 py-2 mb-3"
        />

        {/* Hidden fields */}
        <input type="hidden" name="position" value="100" />
        <input type="hidden" name="priority" value="100" />
        <input type="hidden" name="uploader_type" value="user" />

        {/* End Date */}
        <input
          name="end_date"
          type="date"
          className="w-full h-10 bg-gray-200 rounded px-3 mb-4"
        />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {creating ? "Adding..." : "Add"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      {EditshowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
            <h3 className="text-xl font-semibold mb-4">
              {editingAd ? "Edit Ad" : "Create Ad"}
            </h3>
            <form onSubmit={onEditSubmit} className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <label className="flex flex-col">
                  <span className="mb-1">Title</span>
                  <input
                    name="title"
                    placeholder="Title"
                    defaultValue={editingAd?.title}
                    className="border rounded-lg p-2 w-full"
                    required
                  />
                </label>
                <label className="flex flex-col">
                  <span className="mb-1">Target URL</span>
                  <input
                    name="target_url"
                    placeholder="Target URL"
                    defaultValue={editingAd?.target_url}
                    className="border rounded-lg p-2 w-full"
                  />
                </label>
                <input
                  name="position"
                  placeholder="Position"
                  defaultValue="100"
                  className="border rounded-lg p-2 w-full hidden"
                />
                <input
                  name="priority"
                  placeholder="Priority"
                  defaultValue="100"
                  className="border rounded-lg p-2 w-full hidden"
                />
                <label className="flex flex-col">
                  <span className="mb-1">Media Type</span>
                  <select
                    name="type"
                    defaultValue={editingAd?.type || "image"}
                    className="border rounded-lg p-2 w-full"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </label>
                <label className="flex flex-col">
                  <span className="mb-1">Upload Media</span>
               <input
  id="files"
  name="files"
  type="file"
  accept={mediaType === "image" ? "image/*" : "video/*"}
  className="hidden"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      (mediaType === "image" && !file.type.startsWith("image")) ||
      (mediaType === "video" && !file.type.startsWith("video"))
    ) {
      toast.error(`Please select a ${mediaType} file only`);
      e.target.value = "";
    }
  }}
/>

                  </label>
              </div>
              <label className="flex flex-col">
                  <span className="mb-1">Description</span>
                  <textarea
                    name="description"
                    placeholder="Description"
                    defaultValue={editingAd?.description}
                    className="border rounded-lg p-2 w-full"
                  />
              </label>
              <label className="flex flex-col">
                  <span className="mb-1">Sub Description</span>
                  <textarea
                    name="sub_description"
                    placeholder="Sub Description"
                    defaultValue={editingAd?.sub_description}
                    className="border rounded-lg p-2 w-full"
                  />
              </label>
              <input
                  name="uploader_type"
                  type="text"
                  value="user"
                  className="border rounded-lg p-2 w-full hidden"
                />
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => setEditshowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {creating ? "Saving..." : editingAd ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
