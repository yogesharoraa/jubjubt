"use client";

import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../../Componets/SearchBar/SearchBar";
import Search from "/Images/search.png";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import toast from 'react-hot-toast';


import useApiPost from "../../Hooks/PostData";
import { FaLeaf } from "react-icons/fa6";
interface User {
  id: string;
  user_id: string;
  username: string;
  email: string;
}

export default function AutoPoster() {


  const [files, setFiles] = useState<File[]>([]);

  const [masterNumber, setMasterNumber] = useState<number>(1);

  const [times, setTimes] = useState<string[]>([""]);
  const [uploadStatus, setUploadStatus] = useState<string>(""); // single string
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingfiles, setLoadingfiles] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const { data, error, postData } = useApiPost();
  const [serverTime, setServerTime] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [folderFiles, setFolderFiles] = useState<string[]>([]);
  const [autoPosterTimes, setAutoPosterTimes] = useState(["", "", "", ""]);
  const [autoPosterMaster, setAutoPosterMaster] = useState(1);
  const [posterId, setPosterId] = useState(102);
  const [successMessage, setSuccessMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [videos, setVideos] = useState<
    {
      name: string;
      combinedProgress: number;
      status: string;
      file?: File;
      fileBlob?: Blob;
    }[]
  >([]);

  const ffmpegRef = useRef(new FFmpeg());
  const logRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    const baseURL = "/ffmpeg"; // public folder

    ffmpeg.on("log", ({ message }) => {
      if (logRef.current) logRef.current.innerHTML = message;
    });

    try {
      // convert public files to Blob URLs
      const coreURL = await fetch(`${baseURL}/ffmpeg-core.js`).then(res => res.blob()).then(blob => URL.createObjectURL(blob));
      const wasmURL = await fetch(`${baseURL}/ffmpeg-core.wasm`).then(res => res.blob()).then(blob => URL.createObjectURL(blob));
      const workerURL = await fetch(`${baseURL}/ffmpeg-core.worker.js`).then(res => res.blob()).then(blob => URL.createObjectURL(blob));

      await ffmpeg.load({
        coreURL,
        wasmURL,
        workerURL,
      });

      console.log("FFmpeg loaded from public folder!");
    } catch (err) {
      console.error("FFmpeg load failed:", err);
    }

    setLoaded(true);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selected = Array.from(e.target.files).map(file => ({
      name: file.name,
      combinedProgress: 0,
      status: "Ready",
      file,
    }));

    setVideos(selected);
  };



  useEffect(() => {
    const updateNYTime = () => {
      const now = new Date();

      const options = {
        timeZone: "America/New_York",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };

      const formatter = new Intl.DateTimeFormat("en-US", options);
      const parts = formatter.formatToParts(now);

      const get = (type) => parts.find((p) => p.type === type).value;

      const formatted =
        `${get("hour")}:${get("minute")}:${get("second")}`;

      setServerTime(formatted);
    };

    updateNYTime();
    const timer = setInterval(updateNYTime, 1000);

    return () => clearInterval(timer);
  }, []);


  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    fetchFolderFiles();
    fetchAutoposter();
  }, []);

  const fetchAutoposter = async () => {
    try {
      const payload = {
        limi: "1",
        sort_order: "DESC",
      };

      const response = await postData("/admin/get-auto-poster-id", payload);
      const data = response.data;

      setPosterId(data.id);
      setSelectedUsers(data.users || []);
      setAutoPosterTimes(data.times || ["", "", "", ""]);
      setAutoPosterMaster(data.master_number || 1);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };


  const fetchUsers = async () => {
    try {
      const payload = {
        page: "1",
        pageSize: "100",
        sort_order: "DESC",
      };

      const response = await postData("/admin/get-user", payload);
      if (response?.data) {
        const users = response.data.Records;
        const pagination = response.data.Pagination;
        setUsers(users); 
      }

    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };


  const handleMasterChange = (value: number) => {
    setMasterNumber(value);
    setTimes(Array(value).fill(""));
  };

  const handleTimeChange = (index: number, value: string) => {
    const updated = [...times];
    updated[index] = value;
    setTimes(updated);
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const filteredUsers = users.filter((user) => {
    const username = user?.username || "";
    const email = user?.email || "";

    return (
      username.toLowerCase().includes(userSearch.toLowerCase()) ||
      email.toLowerCase().includes(userSearch.toLowerCase())
    );
  });


  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validation
      if (selectedUsers.length === 0) {
        alert("Please select at least one user");
        return;
      }

      const allPaths = folderFiles.slice(0, masterNumber * selectedUsers.length).map(file => file.path);
      const response = await saveAutoPosterData(allPaths, posterId);
      console.log('response', response);
      if (response.success) {
        setSuccessMessage("Auto Poster updated successfully!");
        setTimeout(() => {
          setSuccessMessage("");
        }, 2000);
      } else {
        setSuccessMessage("Something went wrong. Try again!");
      }

    } catch (err: any) {
      console.error("❌ Auto Poster Error:", err);
      alert(err.response?.data?.message || "Error while saving auto poster settings!");
    } finally {
      setLoading(false);
    }
  };

  // Separate function to handle file uplo
  const saveAutoPosterData = async (filePaths: string[], posterId: string) => {
    const payload = {
      files: filePaths,
      master_number: autoPosterMaster,
      times: autoPosterTimes,
      users: selectedUsers,
    };

    return await postData(
      `/admin/auto-poster/${posterId}`,
      JSON.stringify(payload),
      "application/json"
    );
  };



  const startCompression = async () => {

    setLoadingfiles(true)
    const ffmpeg = ffmpegRef.current;
    let completedUploads = 0; // TRACK ALL UPLOADS

    for (let i = 0; i < videos.length; i++) {
      const current = videos[i];

      setVideos(prev =>
        prev.map((v, idx) => (idx === i ? { ...v, status: "Compressing..." } : v))
      );

      await ffmpeg.writeFile(`input_${i}.mp4`, await fetchFile(current.file!));

      // ---- Compression progress (0–70%) ----
      const updateProgress = ({ progress }: { progress: number }) => {
        const percent = Math.round(progress * 100);
        const combined = Math.floor(percent * 0.7);

        setVideos(prev =>
          prev.map((v, idx) =>
            idx === i ? { ...v, combinedProgress: combined } : v
          )
        );
      };

      ffmpeg.on("progress", updateProgress);

      await ffmpeg.exec([
        "-i",
        `input_${i}.mp4`,
        "-vf",
        "scale='min(720,iw)':-2",
        "-preset",
        "ultrafast",
        "-crf",
        "30",
        "-t",
        "60",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        `output_${i}.mp4`,
      ]);

      ffmpeg.off("progress", updateProgress);

      const data = await ffmpeg.readFile(`output_${i}.mp4`);
      const blob = new Blob([data], { type: "video/mp4" });

      setVideos(prev =>
        prev.map((v, idx) =>
          idx === i
            ? { ...v, fileBlob: blob, status: "Uploading..." }
            : v
        )
      );

      // ---- Upload without blocking ----
      uploadSingleFile(blob, i)
        .then(() => {
          completedUploads++;
          if (completedUploads === videos.length) {
            //  alert("All uploads completed successfully!");
            fetchFolderFiles();
            toast.success("Uploads completed successfully");
            setShowUploadModal(false);
            setVideos([]);
            setUploadStatus("")
            setLoadingfiles(false)
            setUploadStatus("Uploads completed successfully"); // final status
          }
        })
        .catch(() => {
          completedUploads++;
          if (completedUploads === videos.length) {
            toast.success("All uploads finished (some may have failed).");
            //   alert("All uploads finished (some may have failed).");
            setLoadingfiles(false)
          }
        });
    }
  };
  const uploadSingleFile = async (blob: Blob, index: number) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("video", blob, `compressed_${index}.mp4`);

      xhr.open("POST", "http://3.225.161.94:3000/api/admin/auto_upload-file");

      // ---- Upload progress (70–100%) ----
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          const combined = Math.floor(70 + percent * 0.3);

          setVideos(prev =>
            prev.map((v, idx) =>
              idx === index
                ? { ...v, combinedProgress: combined, status: "Uploading..." }
                : v
            )
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setVideos(prev =>
            prev.map((v, idx) =>
              idx === index
                ? { ...v, status: "Completed ✔", combinedProgress: 100 }
                : v
            )
          );
          resolve();
        } else {
          setVideos(prev =>
            prev.map((v, idx) =>
              idx === index
                ? { ...v, status: "Upload Failed ❌" }
                : v
            )
          );
          reject();
        }
      };

      xhr.onerror = () => {
        setVideos(prev =>
          prev.map((v, idx) =>
            idx === index
              ? { ...v, status: "Upload Error ❌" }
              : v
          )
        );
        reject();
      };

      xhr.send(formData);
    });
  };


  const fetchFolderFiles = async () => {
    try {
      const res = await postData("/admin/get-auto-files", {});

      if (res.success) {
        setFolderFiles(res.files); // Array of file names
      }

    } catch (error) {
      console.error("Error fetching folder files:", error);
    }
  };

  const usersWithUsername = filteredUsers.filter(
    user => user.user_name && user.user_name.trim() !== ''
  );


  const availableUsers = usersWithUsername.filter(
    user => !selectedUsers.includes(user.user_id)
  );

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-primary xl:pl-72`}>

      {/* Top Search Bar */}
      <SearchBar />

      <div className="px-4 pb-10 xl:px-6">

        {/* Header */}
        <div className="flex justify-between border-t-[#F2F2F2] py-3">
          <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3">Auto Poster</h2>

          <div className="relative">
            <button
              className="flex items-center  cursor-pointer gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 transition-all text-white font-medium rounded-lg shadow-sm"
              onClick={() => setShowUploadModal(true)}
            >
              <img src={Search} alt="Upload Icon" className="w-5 h-5" />
              Upload Files
            </button>
          </div>

        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <Link to="/dashboard">
            <h3 className="text-[#3A3A3A] font-poppins text-base font-semibold cursor-pointer">Dashboard</h3>
          </Link>
          <div className="w-1 h-1 rounded-full bg-[#E0E0E0]" />
          <h3 className="text-[#858585] font-poppins text-base">Uploader</h3>

        </div>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-[600px] shadow-2xl border border-gray-200 dark:border-gray-700 relative animate-scaleUp">

              {/* Close Icon */}
              <button
                className="absolute right-3 top-3 text-gray-500 hover:text-red-600 transition"
                onClick={() => {
                  setShowUploadModal(false);
                  setVideos([]);
                  setUploadStatus("")
                  setLoadingfiles(false)
                }}
              >
                ✕
              </button>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Video Upload
              </h2>
              {uploadStatus && (
                <p className="text-center font-medium text-blue-600 mt-4">{uploadStatus}</p>
              )}
              {/* Upload Box (show only when no videos uploaded) */}
              {videos.length <= 0 && (
                <label
                  className="cursor-pointer flex flex-col items-center justify-center w-full h-44 mb-5 
          border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl 
          hover:border-blue-500 transition group"
                >
                  <div className="text-center space-y-1">
                    <p className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-blue-600">
                      Click to upload videos
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Supported format: MP4 (60s trim + 720p compress)
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Pending videos: {videos.length}
                    </p>
                  </div>

                  <input type="file" multiple accept="video/*" onChange={handleSelect} className="hidden" />
                </label>
              )}

              {/* Video Progress List */}
              {videos.length > 0 && (
                <div className="space-y-4 h-60 overflow-y-auto pr-2 mb-5 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                  {videos.map((file, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white">
                        <span>{file.name}</span>
                        <span>{file.combinedProgress}%</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2.5 bg-gray-300 dark:bg-gray-700 rounded-full mt-2">
                        <div
                          className="h-2.5 bg-blue-600 rounded-full"
                          style={{ width: `${file.combinedProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <button
                className={`w-full py-2 mb-3 rounded-lg text-white font-medium transition 
         ${loadingfiles
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                  }`}
                onClick={startCompression}
                disabled={loadingfiles && !videos.some(v => v.fileBlob)}
              >
                {uploadStatus
                  ? "Uploaded "
                  : loadingfiles
                    ? "Uploading..."
                    : "Start Upload"}
              </button>

              <button
                className="w-full py-2 rounded-lg border border-gray-300 dark:border-gray-600 
        hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-200"
                onClick={() => {
                  setShowUploadModal(false);
                  setVideos([]);
                  setUploadStatus("")
                  setLoadingfiles(false)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}


        {/* MAIN BOX */}
        <div className="p-6 mx-auto max-w-3xl">
          <div className="bg-white dark:bg-[#1F1F1F] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">

            <h2 className="mb-6 text-2xl font-semibold">Auto Poster Setup</h2>

            <div className="grid grid-cols-2 gap-4">

              {/* LEFT — System Users */}
              <div>
                <h3 className="font-semibold mb-2">System Users</h3>
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">
                  {availableUsers.map(user => (
                    <div key={user.id}
                      className="flex items-center p-3 border-b border-gray-100 dark:border-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.user_id)}
                        onChange={() => handleUserSelection(user.user_id)}
                        className="w-4 h-4"
                      />
                      <label className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {user.username} ({user.user_name})
                      </label>
                    </div>
                  ))}
                  {availableUsers.length === 0 && (
                    <div className="p-3 text-center text-gray-500">No users found</div>
                  )}
                </div>
              </div>

              {/* RIGHT — Selected Users */}
              <div>
                <h3 className="font-semibold mb-2">Selected Users</h3>
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">

                  {selectedUsers.length > 0 ? (
                    selectedUsers.map(id => {
                      const user = usersWithUsername.find(u => u.user_id === id);
                      return (
                        <div key={id}
                          className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700"
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                            {user?.username} ({user?.user_name})
                          </span>
                          <button
                            onClick={() => handleUserSelection(id)}
                            className="text-red-500 text-sm hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-gray-500">
                      No users selected
                    </div>
                  )}
                </div>
              </div>

            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-2xl mb-2" style={{ color: "oklch(54.6% .245 262.881)" }}>Total pending reels ({folderFiles.length}):</h4>
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">Total Posts per User</label>

              <input
                min="1"
                max={folderFiles ? folderFiles.length : 1}
                className="w-32 p-2 border rounded-md bg-gray-50 dark:bg-[#2b2b2b] dark:border-gray-600"
                type="number"
                value={autoPosterMaster}
                onChange={(e) => setAutoPosterMaster(e.target.value)}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Each user will receive {autoPosterMaster} posts
              </p>
            </div>

            {/* Posting Times */}
            <div className="flex justify-between items-center">
              <h4 className="mb-3 text-lg font-semibold">Posting Times</h4>
              <h4 className="mb-3 text-lg font-semibold">
                Current Time: <span className="font-semibold text-blue-600">{serverTime || "Loading..."}</span>
              </h4></div>
            <div className="space-y-4 mb-6">
              {/* Post 1 */}

              {autoPosterTimes.map((t, index) => (
                <div className="flex items-center gap-4" key={index}>
                  <span className="font-medium w-28">Time {index + 1}</span>
                  <input
                    className="p-2 border rounded-md bg-gray-50 dark:bg-[#2b2b2b] dark:border-gray-600"
                    type="time"
                    value={t}
                    onChange={(e) => {
                      const newTimes = [...autoPosterTimes];
                      newTimes[index] = e.target.value;
                      setAutoPosterTimes(newTimes);
                    }}
                  />
                </div>
              ))}


            </div>


            {/* Summary */}
            {selectedUsers.length > 0 && files && files.length > 0 && (
              <div className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Summary</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  • {selectedUsers.length} users selected<br />
                  • {folderFiles.length} files uploaded<br />
                  • {autoPosterMaster} posts per user<br />
                  • Total scheduled posts: {selectedUsers.length * autoPosterMaster}<br />
                  • Remaining files: {folderFiles.length - (selectedUsers.length * autoPosterMaster)}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || selectedUsers.length === 0}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white 
              font-medium rounded-lg shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed transition"
            >
              {loading ? "Updating Auto Poster Settings..." : "Update Auto Poster Settings"}
            </button>
            <div className="success-msg">
              {successMessage && (
                <p className="text-green-600 font-medium">{successMessage}</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}