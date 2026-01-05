// AdminAdsManager.tsx
import { useEffect, useState,useRef } from "react";
import { useSelector } from "react-redux";
import useApiPost from "../../Hooks/PostData";
import { useSearchParams } from "react-router-dom";
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
  files?: string | File | null;
  media_url: string;
  target_url: string;
  position: number;
  priority: number;
  is_active: boolean;
  createdAt?: string;
  deleted_at?: string | null;
};

const TITLE_TO_ACTION: Record<string, string> = {
  "Stream Now": "stream_now",
  "Book Now": "book_now",
  "Learn More": "learn_more",
  "Get Tickets": "get_tickets",
  "Watch Now": "watch_now",
  "Shop Now": "shop_now",
  "Sign Up": "sign_up",
};


type Pagination = {
  current_page: number;
  records_per_page: number;
  total_records: number;
};

const defaultPagination: Pagination = { current_page: 1, records_per_page: 10, total_records: 0 };

const AdminAdsManager = () => {
  const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);

  // existing hooks
  const { data, loading, error, postData } = useApiPost();
  const [showFullDesc, setShowFullDesc] = useState(false);

  const { postData: postMutate, loading: saving } = useApiPost();
  const [positionType, setPositionType] = useState<"random" | "top">("random");

  const { postData: postDelete, loading: deleting } = useApiPost();
  const [searchParams] = useSearchParams();
const status = searchParams.get("status");
console.warn('status :',status ) // "active" | "inactive" | null


  // new hooks for global frequency
  const { data: freqData, loading: freqLoading, postData: postFreq } = useApiPost();

  const [ads, setAds] = useState<AdItem[]>([]);
  const [search, setSearch] = useState("");
  const [editActionButton, setEditActionButton] = useState("learn_more");

  const [pagination, setPagination] = useState<Pagination>(defaultPagination);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const [creating, setCreating] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [updating, setUpdating] = useState(false);
  const [positondisable, setpositondisable] = useState(false);
  const [mediaBlobMap, setMediaBlobMap] = useState<Record<string, string>>({});


  // global frequency state
  const [globalFrequency, setGlobalFrequency] = useState<number>(5);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
const [videoError, setVideoError] = useState(false);
const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
const [showControls, setShowControls] = useState(false);

const [imageError, setImageError] = useState(false);
const [newAdPosition, setNewAdPosition] = useState<number>(1);
const [isPlaying, setIsPlaying] = useState(true);
const videoRef = useRef<HTMLVideoElement | null>(null);




  const [position, setPosition] = useState("");
  const [positionError, setPositionError] = useState("");

  // selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAllOnPage, setSelectAllOnPage] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // preview modal
  const [previewAd, setPreviewAd] = useState<AdItem | null>(null);

  const checkPosition = async (value: string) => {
    if (!value) return;

    try {
      const result = await postMutate("/admin/check-position", {
        position: value
      });

      // if (result?.data?.exists) {
      //   setPositionError("This position is already used!");
      //   setpositondisable(true);
      // } else {
        setPositionError("");
        setpositondisable(false);
      // }

    } catch (error) {
      console.error("Error checking position:", error);
    }
  };

const fetchList = (page = pagination.current_page, pageSize = pagination.records_per_page) => {
  const fd = new FormData();
  fd.append("page", String(page));
  fd.append("pageSize", String(pageSize));

  if (search.trim()) fd.append("q", search.trim());

  // ✅ STATUS FILTER
  if (status === "active") fd.append("is_active", "1");
  if (status === "inactive") fd.append("is_active", "0");
  console.log('filter',status)
  postData("/admin/ads/list", fd);
};
const getActionLabel = (title?: string) => {
  if (!title) return "Learn More";
  return title;
};


  // fetch ads
  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current_page, pagination.records_per_page, status,]);
  useEffect(() => {
  if (previewAd?.type === "video") {
    setShowControls(true); // 👈 icon visible on open
  }
}, [previewAd]);

  useEffect(() => {
  if (previewAd?.type === "video") {
    setIsPlaying(true);
  }
}, [previewAd]);

useEffect(() => {
  setPagination(p => ({ ...p, current_page: 1 }));
  fetchList(1, pagination.records_per_page);
}, [status]);

  useEffect(() => {
  if (data?.data) {
    const Records = data.data.Records.map((ad: any) => ({
      ...ad,
      createdAt: ad.createdAt || ad.created_at || null,
    }));

    setAds(Records);
    if (data.data.Pagination) setPagination(data.data.Pagination);
  }
}, [data]);
useEffect(() => {
  if (!previewAd || previewAd.type !== "image") {
    setImageBlobUrl(null);
    setImageError(false);
    return;
  }

  let revoked = false;

  fetch(previewAd.media_url)
    .then(res => {
      if (!res.ok) throw new Error("Image fetch failed");
      return res.blob();
    })
    .then(blob => {
      if (revoked) return;
      const url = URL.createObjectURL(blob);
      setImageBlobUrl(url);
    })
    .catch(err => {
      console.error("Image blob error:", err);
      setImageError(true);
    });

  return () => {
    revoked = true;
    if (imageBlobUrl) URL.revokeObjectURL(imageBlobUrl);
  };
}, [previewAd]);


useEffect(() => {
  if (!previewAd || previewAd.type !== "video") return;

  let revoked = false;

  const loadVideo = async () => {
    try {
      setVideoError(false);
      const res = await fetch(previewAd.media_url);
      const blob = await res.blob();

      if (!revoked) {
        const blobUrl = URL.createObjectURL(blob);
        setVideoBlobUrl(blobUrl);
      }
    } catch (err) {
      console.error("Video blob load failed", err);
      setVideoError(true);
    }
  };

  loadVideo();

  return () => {
    revoked = true;
    if (videoBlobUrl) {
      URL.revokeObjectURL(videoBlobUrl);
    }
    setVideoBlobUrl(null);
  };
}, [previewAd]);


  // fetch global frequency (on mount)
  useEffect(() => {
    const fd = new FormData();
    postFreq("/admin/ads/frequency", fd);
  }, []);

  useEffect(() => {
    if (freqData?.data?.frequency != null) {
      setGlobalFrequency(Number(freqData.data.frequency) || 5);
    }
  }, [freqData]);

  const loadMediaBlob = async (ad: AdItem) => {
  if (mediaBlobMap[ad.id]) return;

  try {
    const res = await fetch(ad.media_url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    setMediaBlobMap(prev => ({
      ...prev,
      [ad.id]: blobUrl,
    }));
  } catch (err) {
    console.error("Media blob failed:", ad.media_url);
  }
};


const handleToggleActive = async (ad: AdItem) => {
  const fd = new FormData();
  fd.append("id", ad.id);
  fd.append("is_active", String(!ad.is_active));

  const res = await postMutate("/admin/ads/toggle", fd);

  if (!res?.status) {
    toast.error(res?.message || "Failed to toggle");
    return;
  }

  toast.success(!ad.is_active ? "Ad activated" : "Ad deactivated");

  fetchList(1, pagination.records_per_page);
};





  const handleDeleteRow = async (ad: AdItem) => {
    const ok = window.confirm("Delete this ad? This cannot be undone.");
    if (!ok) return;
    const fd = new FormData();
    fd.append("id", ad.id);
    const res = await postDelete("/admin/ads/delete", fd);
    fetchList(1, pagination.records_per_page);
    if (res?.status) {
      toast.success("Ad deleted");
      setAds(prev => prev.filter(a => a.id !== ad.id));
      if (ads.length === 1 && pagination.current_page > 1) {
        setPagination(p => ({ ...p, current_page: p.current_page - 1 }));
      }
    } else {
      toast.error(res?.message || "Delete failed");
    }
  };

 const handleBulkToggle = async (makeActive: boolean) => {
  if (!selectedIds.length) {
    toast.error("No ads selected");
    return;
  }
  if (bulkProcessing) return;

  if (!window.confirm(makeActive ? "Activate selected ads?" : "Deactivate selected ads?")) return;

  setBulkProcessing(true);

  const previousAds = ads;
  setAds(prev => prev.filter(ad => !selectedIds.includes(ad.id)));

  try {
    const results = await Promise.all(
      selectedIds.map(id => {
        const fd = new FormData();
        fd.append("id", id);
        fd.append("is_active", String(makeActive));
        return postMutate("/admin/ads/toggle", fd);
      })
    );

    const anyFailed = results.some(r => !r?.status);
    if (anyFailed) {
      toast.error("Some updates failed, reverting…");
      setAds(previousAds); // rollback
    } else {
      toast.success(makeActive ? "Selected ads activated" : "Selected ads deactivated");
    }

    setSelectedIds([]);
    setSelectAllOnPage(false);
  } catch (err) {
    console.error(err);
    toast.error("Bulk update failed");
    setAds(previousAds); // rollback
  } finally {
    setBulkProcessing(false);
  }
};


  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(p => ({ ...p, current_page: 1 }));
    fetchList(1, pagination.records_per_page);
  };

  const onCreateSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (creating) return;
    setCreating(true);

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    // 🔥 ACTION BUTTON → TITLE
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

  fd.append("title", map[actionButton] || "Learn More");
}

    const file = fd.get("files");
    const token = Cookies.get("token");
    let filePath = null;
// 🔥 POSITION LOGIC (DO NOT TOUCH OTHER LOGIC)
if (positionType === "top") {
  fd.set("position", "1");
} else {
  fd.set("position", String(newAdPosition));
}

    // 1️⃣ Upload file first if selected
    if (file instanceof File) {
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
          filePath = 'http://3.225.161.94:3000' + data.path;
        } else {
          toast.error(data.message || "File upload failed");
          setCreating(false);
          return;
        }
      } catch (err) {
        console.error("Upload failed:", err);
        toast.error("Upload failed");
        setCreating(false);
        return;
      }
    }

    // 2️⃣ Add uploaded file path to main form if applicable
    if (filePath) {
      fd.delete("media_url");
      fd.append("media_url", filePath);
    }

    // Map end date -> deleted_at for backend
    const endDate = (fd.get("end_date") as string) || "";
    if (endDate) {
      fd.append("created_at", new Date(endDate + "T00:00:00").toISOString());
      fd.append("deleted_at", new Date(endDate + "T00:00:00").toISOString());
    }

    fd.delete("frequency");

    if (!fd.get("target_url")) { toast.error("Target Link is required"); setCreating(false); return; }
    if (!fd.get("file") && !fd.get("media_url")) { /* allow since file might be uploaded above */ }

    const res = await postMutate("/admin/ads/create", fd);
    setCreating(false);

    if (res?.status) {
      toast.success("Ad added");
      setShowAddModal(false);
      formEl.reset();
      setPagination(p => ({ ...p, current_page: 1 }));
      fetchList(1, pagination.records_per_page);
    } else {
      toast.error(res?.message || "Failed to add");
    }
  };

const openEdit = (ad: AdItem) => {
  setEditingAd(ad);
  setShowEditModal(true);
  setPosition(String(ad.position));

   setPositionType(ad.position === 1 ? "top" : "random");
  // 🔥 REAL FIX
  setEditActionButton(
    (ad.title && TITLE_TO_ACTION[ad.title]) || "learn_more"
  );
};


const onEditSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
  e.preventDefault();
  if (!editingAd || updating) return;

  setUpdating(true);

  // ✅ CALCULATE MAX POSITION (VERY IMPORTANT)
  const maxPosition =
    ads.length > 0
      ? Math.max(...ads.map(a => Number(a.position) || 0))
      : 0;

  try {
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    fd.append("id", editingAd.id);

    const file = fd.get("files");
    const token = Cookies.get("token");
    let filePath: string | null = null;

    // =========================
    // 🔥 ACTION BUTTON → TITLE
    // =========================
    const actionButton = fd.get("action_button") as string | null;

    if (actionButton) {
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

    // =========================
    // 🔥 POSITION LOGIC (FINAL)
    // =========================
    if (positionType === "top") {
      // Any ad → Top
      fd.set("position", "1");
    } else {
      // Random selected
      if (editingAd.position === 1) {
        // Top → Random → send to LAST
        fd.set("position", String(maxPosition + 1));
      } else {
        // Random → Random → keep same
        fd.set("position", String(editingAd.position));
      }
    }

    // =========================
    // 🔥 FILE UPLOAD (OPTIONAL)
    // =========================
    if (file instanceof File && file.size > 0) {
      const fileFormData = new FormData();
      fileFormData.append("files", file);

      const uploadRes = await fetch(
        "http://3.225.161.94:3000/api/admin/ads/upload-file",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fileFormData,
        }
      );

      const data = await uploadRes.json();

      if (!data.success) {
        throw new Error(data.message || "File upload failed");
      }

      filePath = "http://3.225.161.94:3000" + data.path;
    }

    if (filePath) {
      fd.delete("media_url");
      fd.append("media_url", filePath);
    } else {
      if (file instanceof File && file.size === 0) {
        fd.delete("files");
      }
    }

    // =========================
    // 🔥 END DATE → deleted_at
    // =========================
    const endDate = (fd.get("end_date") as string) || "";
    fd.set(
      "deleted_at",
      endDate ? new Date(endDate + "T00:00:00").toISOString() : ""
    );

    fd.delete("frequency");

    // =========================
    // 🔥 API CALL
    // =========================
    const res = await postMutate("/admin/ads/update", fd);

    if (!res?.status) {
      throw new Error(res?.message || "Failed to update");
    }

    toast.success("Ad updated");
    setShowEditModal(false);
    setEditingAd(null);
    fetchList(pagination.current_page, pagination.records_per_page);

  } catch (err: any) {
    console.error(err);
    toast.error(err.message || "Something went wrong");
  } finally {
    // 🔥 ALWAYS RELEASE BUTTON
    setUpdating(false);
  }
};



  const onSaveGlobalFrequency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingGlobal) return;

    if (!globalFrequency || Number.isNaN(globalFrequency) || globalFrequency < 1) {
      toast.error("Please enter a valid frequency (≥ 1)");
      return;
    }

    setSavingGlobal(true);

    const res = await postFreq("/admin/ads/frequency/update", {
      frequency: Math.floor(globalFrequency),
    });

    setSavingGlobal(false);

    if (res?.success) {
      toast.success("Global frequency saved");
    } else {
      toast.error(res?.message || "Failed to save frequency");
    }
  };

  useEffect(() => {
    if (ads.length > 0) {
      // console logs kept for debug
      console.log("All ads data:", ads);
    }
  }, [ads]);

  // selection helpers
  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
  };

  const handleSelectAllOnPage = () => {
    if (!selectAllOnPage) {
      // select all visible on current page
      const pageItems = ads.map(a => a.id);
      setSelectedIds(pageItems);
      setSelectAllOnPage(true);
    } else {
      setSelectedIds([]);
      setSelectAllOnPage(false);
    }
  };

  return (
    <div className={`bg-primary ${isSidebarOpen ? 'xl:pl-20' : 'xl:pl-72'}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Ads Manager</h1>
          <div className="flex items-center gap-2">
           <button
  onClick={() => {
    const maxPosition =
      ads.length > 0
        ? Math.max(...ads.map(a => Number(a.position) || 0))
        : 0;

    setNewAdPosition(maxPosition + 1);
    setShowAddModal(true);
  }}
  className="flex items-center gap-2 bggradient px-4 py-2 rounded-md text-white text-sm font-medium"
>
  ➕ Add Advertisement
</button>


            <form onSubmit={onSearchSubmit} className="flex gap-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search title/desc/link"
                className="border rounded px-3 py-2 w-64"
              />
              <button className="px-4 py-2 rounded bg-black text-white">Search</button>
            </form>
          </div>
        </div>

        <div className="mb-3 text-sm text-gray-600">
          {loading ? "Loading ads…" : `${pagination.total_records || ads.length} ads`}
        </div>

        {/* Bulk action header (added Active/Inactive + Select all) */}
        <div className="flex items-center justify-end gap-2 mb-2">
          <button
            onClick={() => handleBulkToggle(true)}
            className="px-3 py-1 rounded bg-green-600 text-white flex items-center gap-2"
            disabled={bulkProcessing}
            title="Activate selected ads"
          >
            Active
          </button>
          <button
            onClick={() => handleBulkToggle(false)}
            className="px-3 py-1 rounded bg-gray-500 text-white flex items-center gap-2"
            disabled={bulkProcessing}
            title="Deactivate selected ads"
          >
            Inactive
          </button>

          <button
            onClick={handleSelectAllOnPage}
            className="px-3 py-1 rounded border"
            title="Select all on current page"
          >
            {selectAllOnPage ? "Unselect all" : "Select all"}
          </button>
        </div>

        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 w-12">
                  {/* header checkbox (kept simple) */}
                  <input
                    type="checkbox"
                    checked={selectAllOnPage}
                    onChange={handleSelectAllOnPage}
                  />
                </th>
                <th className="text-left p-3 w-16">#</th>
                <th className="text-left p-3 w-40">Uploader</th>
                <th className="text-left p-3 w-28">Type</th>
                <th className="text-left p-3 w-[240px]">Preview</th>
                <th className="text-left p-3 w-[260px]">Target Link</th>
                <th className="text-left p-3 w-24">Position</th>
                <th className="text-left p-3 w-[260px]">Title</th>
                <th className="text-left p-3 w-40">End Date</th>
                <th className="text-left p-3 w-28">Status</th>
                <th className="text-left p-3 w-48">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad, idx) => (
                <tr key={ad.id} className={idx % 2 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(ad.id)}
                      onChange={() => toggleSelectRow(ad.id)}
                    />
                  </td>

                  <td className="p-3">{(pagination.current_page - 1) * pagination.records_per_page + idx + 1}</td>
                  <td className="p-3">
                    <div className="font-medium">{ad.uploader_name || "-"}</div>
                    <div className="text-xs text-gray-500">{ad.uploader_type}</div>
                  </td>
                  <td className="p-3 capitalize">{ad.type}</td>
                  <td className="p-3">
  {mediaBlobMap[ad.id] ? (
    ad.type === "image" ? (
      <img
        src={mediaBlobMap[ad.id]}
        className="h-12 w-20 object-cover rounded border"
        alt="ad"
      />
    ) : (
      <video
        src={mediaBlobMap[ad.id]}
        className="h-12 w-20 object-cover rounded border"
        muted
      />
    )
  ) : (
    <div
      onMouseEnter={() => loadMediaBlob(ad)} // 🔥 lazy load
      className="h-12 w-20 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500 cursor-pointer"
    >
      Preview
    </div>
  )}

  <div className="text-xs text-gray-500 mt-1 truncate max-w-[220px]">
    {ad.title || "-"}
  </div>
</td>

                  <td className="p-3 truncate max-w-[260px]">{ad.target_url}</td>
                  <td className="p-3">
  {ad.position === 1  ? "Top" : "Random"}
</td>
                  <td className="p-3">{ad.title || "-"}</td>
                  <td className="p-3">{ad.deleted_at ? new Date(ad.deleted_at).toLocaleDateString() : "-"}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleActive(ad)}
                      className={`px-3 py-1 rounded text-white ${ad.is_active ? "bg-green-600" : "bg-gray-400"}`}
                      disabled={saving}
                      title={ad.is_active ? "Active" : "Inactive"}
                    >
                      {ad.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 items-center">
                      {/* Preview icon */}
                      <button
                        onClick={() => setPreviewAd(ad)}
                        className="p-1 rounded hover:bg-gray-100"
                        title="Preview"
                      >
                        <img src="/Images/eye.png" alt="preview" className="h-5 w-5" />
                      </button>

                      {/* Edit icon */}
                      <button
                        onClick={() => openEdit(ad)}
                        className="p-1 rounded hover:bg-gray-100"
                        title="Edit"
                      >
                        <img src="/Images/edit.png" alt="edit" className="h-5 w-5" />
                      </button>

                      {/* Delete icon */}
                      <button
                        onClick={() => handleDeleteRow(ad)}
                        className="p-1 rounded hover:bg-gray-100"
                        disabled={deleting}
                        title="Delete"
                      >
                        <img src="/Images/trash.png" alt="delete" className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && ads.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center p-6 text-gray-500">No ads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Page {pagination.current_page} · {pagination.records_per_page} per page
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, current_page: Math.max(1, p.current_page - 1) }))}
              className="px-3 py-1 border rounded"
              disabled={pagination.current_page <= 1}
            >
              Prev
            </button>
            <button
              onClick={() => setPagination(p => ({ ...p, current_page: p.current_page + 1 }))}
              className="px-3 py-1 border rounded"
              disabled={(pagination.current_page * pagination.records_per_page) >= (pagination.total_records || 0)}
            >
              Next
            </button>

            <select
              className="border rounded px-2 py-1"
              value={pagination.records_per_page}
              onChange={e => setPagination(p => ({ ...p, records_per_page: Number(e.target.value), current_page: 1 }))}
            >
              {[10,20,50,100].map(n => <option key={n} value={n}>{n}/page</option>)}
            </select>
          </div>
        </div>

        {/* Global frequency form */}
        <div className="mt-8 p-4 border rounded-md bg-white">
          <h3 className="text-md font-semibold mb-2">Global Ad Frequency (N feeds)</h3>
          <p className="text-sm text-gray-600 mb-4">
            This value controls how often ads appear globally. It replaces per-row frequency.
          </p>
          <form onSubmit={onSaveGlobalFrequency} className="flex items-end gap-3">
            <div>
              <label className="text-sm">Frequency*</label>
              <input
                type="number"
                min={1}
                value={globalFrequency}
                onChange={e => setGlobalFrequency(Number(e.target.value))}
                className="border rounded px-3 py-2 w-40"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded"
              disabled={savingGlobal || freqLoading}
            >
              {savingGlobal ? "Saving…" : "Save"}
            </button>
            {freqLoading && <span className="text-sm text-gray-500">Loading current value…</span>}
          </form>
        </div>
      </div>

      {/* Add Modal */}
{/* --- Replace Add Modal with this block --- */}
{showAddModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div
      className="bg-gray-100 p-6 rounded-md w-[560px] max-h-[80vh] overflow-y-auto shadow-lg"
      style={{ minWidth: 560 }}
    >
      <h2 className="text-lg font-semibold mb-4">Add Advertisement</h2>

      <form onSubmit={onCreateSubmit} encType="multipart/form-data">
        {/* top grey line (target link) */}
        <div className="mb-3">
          <input
            name="target_url"
            placeholder="Target Link (https://...)"
            required
            className="w-full h-10 bg-gray-300 rounded px-3 placeholder-gray-600"
          />
        </div>

        {/* second grey line (type) */}
        <div className="mb-4">
          <select
            name="type"
            className="w-full h-10 bg-gray-300 rounded px-3 text-sm"
            required
            defaultValue="image"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        {/* Upload row with fixed Action Buttons column */}
        <div className="mb-4 flex items-start gap-4">
          {/* left: upload */}
          <div className="flex-1">
            <label
              htmlFor="files"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-300 rounded cursor-pointer select-none"
            >
              <span className="text-sm font-medium">Upload Media</span>
            </label>

            <input
              id="files"
              name="files"
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const fileName = e.target.files?.[0]?.name || "";
                const display = document.getElementById("file-name-display");
                if (display) display.textContent = fileName || "No file selected";
              }}
            />

            {/* large grey bar under upload to match mock */}
            {/* <div className="mt-3 h-8 bg-gray-300 rounded w-full" /> */}

            {/* Filename line (fixed max width + truncate) */}
            <div className="mt-2 text-xs text-gray-700">
              <div
                id="file-name-display"
                className="truncate text-sm"
                style={{ maxWidth: "100%" }}
                title="No file selected"
              >
                No file selected
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3">Only MP4 allowed for video. (Or provide media URL below)</p>
          </div>

          {/* right: ACTION BUTTONS (fixed width so it won't move) */}
          <div className="w-44 flex-shrink-0">
            <div className="text-sm font-medium mb-2">Action Buttons</div>

            <div className="flex flex-col gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="action_button" value="stream_now" />
                <span>Stream Now</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="radio" name="action_button" value="book_now" />
                <span>Book Now</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="radio" name="action_button" value="learn_more" defaultChecked />
                <span>Learn More</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="radio" name="action_button" value="get_tickets" />
                <span>Get Tickets</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="radio" name="action_button" value="watch_now" />
                <span>Watch Now</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="radio" name="action_button" value="shop_now" />
                <span>Shop Now</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="radio" name="action_button" value="sign_up" />
                <span>Sign Up</span>
              </label>
            </div>
          </div>
        </div>

        {/* big grey bar (to match mock spacing) */}
        {/* <div className="mb-4 h-10 bg-gray-300 rounded" /> */}

        {/* Description */}
        <div className="mb-3">
          <textarea
            name="description"
            rows={2}
            placeholder="Description (optional)"
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Position + hidden priority */}
        <div className="mb-3 grid grid-cols-3 gap-3">
          <div>
   <select
  className="w-full h-10 bg-gray-200 rounded px-3"
  value={positionType}
  onChange={(e) => setPositionType(e.target.value as "random" | "top")}
>
  <option value="random">Random</option>
  <option value="top">Top</option>
</select>


          </div>
          <div className="opacity-0">
            <input name="priority" type="number" defaultValue={0} min={0} className="w-full h-10 bg-gray-200 rounded px-3" />
          </div>
        </div>

        {/* End Date */}
        <div className="mb-4">
          <input name="end_date" type="date" className="w-full h-10 bg-gray-200 rounded px-3" />
          {/* <p className="text-xs text-gray-500 mt-1">Sent to backend as <code>deleted_at</code>.</p> */}
        </div>

        {/* bottom small grey button + big grey bar to match mock */}
        {/* <div className="mb-4">
          <div className="inline-block bg-gray-300 rounded px-6 py-2">Preview</div>
        </div> */}

        {/* <div className="mb-6 h-8 bg-gray-300 rounded" /> */}

        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-300 rounded" disabled={creating}>
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded" disabled={creating}>
            {creating ? "Adding..." : "Add"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
{/* --- End replacement --- */}


      {/* Edit Modal */}
{showEditModal && editingAd && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div
      className="bg-gray-100 p-6 rounded-md w-[560px] max-h-[80vh] overflow-y-auto shadow-lg"
      style={{ minWidth: 560 }}
    >
      <h2 className="text-lg font-semibold mb-4">Edit Advertisement</h2>

      <form onSubmit={onEditSubmit} encType="multipart/form-data">
        {/* Target Link */}
        <div className="mb-3">
          <input
            name="target_url"
            defaultValue={editingAd.target_url}
            placeholder="Target Link (https://...)"
            required
            className="w-full h-10 bg-gray-300 rounded px-3 placeholder-gray-600"
          />
        </div>

        {/* Type */}
        <div className="mb-4">
          <select
            name="type"
            defaultValue={editingAd.type}
            className="w-full h-10 bg-gray-300 rounded px-3 text-sm"
            required
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        {/* Upload + Action Buttons */}
        <div className="mb-4 flex items-start gap-4">
          {/* Upload */}
          <div className="flex-1">
            <label
              htmlFor="files"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-300 rounded cursor-pointer select-none"
            >
              <span className="text-sm font-medium">Upload Media</span>
            </label>

            <input
              id="files"
              name="files"
              type="file"
              accept="image/*,video/*"
              className="hidden"
            />

            <div className="mt-2 text-xs text-gray-700 truncate">
              Upload new file (optional)
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Only MP4 allowed for video.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-44 flex-shrink-0">
            <div className="text-sm font-medium mb-2">Action Buttons</div>

            <div className="flex flex-col gap-3 text-sm">
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
  checked={editActionButton === val}
  onChange={() => setEditActionButton(val)}
/>

                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-3">
          <textarea
            name="description"
            defaultValue={editingAd.description || ""}
            rows={2}
            placeholder="Description (optional)"
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Hidden fields (kept for backend compatibility) */}
        <input type="hidden" name="title" value={editingAd.title || ""} />
        <input type="hidden" name="sub_description" value={editingAd.sub_description || ""} />
        <input type="hidden" name="priority" value={editingAd.priority} />

        {/* Position */}
        <div className="mb-3">
         <select
  className="w-full h-10 bg-gray-200 rounded px-3"
  value={positionType}
  onChange={(e) => setPositionType(e.target.value as "random" | "top")}
>
  <option value="random">Random</option>
  <option value="top">Top</option>
</select>

          {positionError && (
            <p className="text-red-500 text-xs mt-1">{positionError}</p>
          )}
        </div>

        {/* End Date */}
        <div className="mb-4">
          <input
            name="end_date"
            type="date"
            defaultValue={
              editingAd.deleted_at
                ? new Date(editingAd.deleted_at).toISOString().slice(0, 10)
                : ""
            }
            className="w-full h-10 bg-gray-200 rounded px-3"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setShowEditModal(false);
              setEditingAd(null);
            }}
            className="px-4 py-2 bg-gray-300 rounded"
            disabled={updating}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded"
            disabled={updating || positondisable}
          >
            {updating ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}


{/* Preview Modal */}
{previewAd && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
   <div
  className="relative w-[500px] h-[700px] rounded-2xl overflow-hidden bg-black"
  onMouseEnter={() => setShowControls(true)}
  onMouseLeave={() => {
    if (isPlaying) setShowControls(false);
  }}
>


      {/* Close */}
      <button
        onClick={() => {
          setPreviewAd(null);
          setShowFullDesc(false);
          setIsMuted(true);
        }}
        className="absolute top-3 right-3 z-20 text-white text-xl"
      >
        ✕
      </button>

      {/* Media */}
      {previewAd.type === "image" ? (
        imageBlobUrl ? (
          <img
            src={imageBlobUrl}
            className="absolute inset-0 w-full h-full object-cover"
            alt="preview"
          />
        ) : imageError ? (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            Failed to load image
          </div>
        ) : null
      ) : videoBlobUrl ? (
<video
  ref={videoRef}
  className="absolute inset-0 w-full h-full object-cover"
  src={videoBlobUrl}
  autoPlay
  muted={isMuted}
  loop
  playsInline
  onPlay={() => setIsPlaying(true)}
  onPause={() => setIsPlaying(false)}
/>



      ) : videoError ? (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Failed to load video
        </div>
      ) : null}

{/* ▶️⏸ Center Play / Pause Button */}
{previewAd.type === "video" && showControls && (
  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
    <img
      src={isPlaying ? "/Images/pause.png" : "/Images/play.png"}
      alt="play-pause"
      className="w-10 h-10 opacity-90 cursor-pointer pointer-events-auto"
      draggable={false}
      onClick={(e) => {
        e.stopPropagation();
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
          videoRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }}
    />
  </div>
)}



{/* 🔊 Mute / Unmute (Bottom Right – PNG Icons) */}
{previewAd.type === "video" && (
  <button
    onClick={() => setIsMuted(v => !v)}
    className="absolute bottom-28 right-4 z-30 bg-black/70 backdrop-blur-md p-3 rounded-full shadow-lg flex items-center justify-center"
    title={isMuted ? "Unmute" : "Mute"}
  >
    <img
      src={
        isMuted
          ? "/Images/muted.png"
          : "/Images/unmuted.png"
      }
      alt={isMuted ? "Muted" : "Unmuted"}
      className="w-5 h-5 object-contain"
      draggable={false}
    />
  </button>
)}



      {/* Top overlay */}
      <div className="absolute top-3 left-3 z-10 text-white text-xs opacity-80">
        Sponsored
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">

        {/* Action Button */}
        <button
          onClick={() => window.open(previewAd.target_url, "_blank")}
          className="mb-3 px-4 py-2 bg-pink-500 text-white rounded-lg font-medium"
        >
          {previewAd.title || "Learn More"}
        </button>

        {/* Description (fixed width, no pushing date) */}
        <div
          onClick={() => setShowFullDesc(v => !v)}
          className={`text-sm text-white cursor-pointer ${
            showFullDesc ? "" : "line-clamp-2"
          }`}
          style={{
            maxWidth: "85%",
            marginBottom: "8px",
          }}
        >
          {previewAd.description || "No description available"}
        </div>

        {/* Date – always stays below */}
        <div className="text-xs text-gray-300 flex items-center gap-2">
          <span>📅</span>
          {previewAd.createdAt &&
            new Date(previewAd.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  </div>
)}



    </div>
  );
};

export default AdminAdsManager;
