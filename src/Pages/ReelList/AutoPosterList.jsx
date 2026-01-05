"use client";
import React, { useEffect, useState } from "react";
import useApiPost from "../../Hooks/PostData";
import SearchBar from "../../Componets/SearchBar/SearchBar";
import Search from "/Images/search.png";
import { Link } from "react-router-dom";

export default function AutoPosterList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { postData } = useApiPost();
  const [userSearch, setUserSearch] = useState("");

  const BASE_URL = "http://3.225.161.94:3000/";

  const fetchList = async () => {
    try {
      const res = await postData("/admin/auto-poster/list");
      setList(res.data || []);
      setLoading(false);
    } catch (error) {
      console.log("❌ List fetch error:", error);
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await postData(`/admin/auto-poster/delete/${id}`);
      setList(list.filter((item) => item.id !== id));
    } catch (error) {
      console.log("❌ Delete error:", error);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className={`bg-primary xl:pl-72`}>

      <SearchBar />

      <div className="px-4 pb-10 xl:px-6">
        <div className="flex justify-between border-t-[#F2F2F2] py-3">
          <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3">
            Auto Poster Jobs
          </h2>

          <div className="relative">
            <div className="absolute flex items-center p-2 transform -translate-y-1/2 left-2 top-1/2">
              <img src={Search} alt="Search" className="w-5 h-5" />
            </div>
            <input
              type="text"
              className="bg-[#00000005] border border-bordercolor border-opacity-10 
              rounded-lg md:w-[250px] w-[180px] py-2 pl-10 text-sm
              focus:outline-none focus:ring-1 focus:ring-gray-600"
              placeholder="Search by username..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Link to="/dashboard">
            <h3 className="text-[#3A3A3A] font-poppins text-base font-semibold cursor-pointer">
              Dashboard
            </h3>
          </Link>
          <div className="w-1 h-1 rounded-full bg-[#E0E0E0]" />
          <h3 className="text-[#858585] font-poppins text-base">Jobs List</h3>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : list.length === 0 ? (
          <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg">
            No AutoPoster items found.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-md border">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs border-b">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Media</th>
                  <th className="p-3">Master No</th>
                  <th className="p-3">Times</th>
                  <th className="p-3">Users</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {list
                  .filter((item) =>
                    item.master_number
                      ?.toString()
                      .toLowerCase()
                      .includes(userSearch.toLowerCase())
                  )
                  .map((item) => (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      {/* ID */}
                      <td className="p-3 font-semibold">{item.id}</td>

                      {/* Media preview */}
                      <td className="p-3">
                        <div className="flex gap-2 overflow-x-auto">
                          {item.files?.slice(0, 15).map((f, i) => {
                            const finalUrl = f.startsWith("http")
                              ? f
                              : BASE_URL + f.replace(/^\/+/, "");

                            return f.endsWith(".mp4") ? (
                              <video
                                key={i}
                                src={finalUrl}
                                className="w-12 h-12 rounded object-cover border cursor-pointer"
                                onClick={() => window.open(finalUrl, "_blank")}
                              />
                            ) : (
                              <img
                                key={i}
                                src={finalUrl}
                                className="w-12 h-12 rounded object-cover border cursor-pointer"
                                onClick={() => window.open(finalUrl, "_blank")}
                              />
                            );
                          })}
                        </div>
                      </td>

                      <td className="p-3">{item.master_number}</td>

                      <td className="p-3">
                        <span className="font-mono text-blue-600">
                          {item.times?.join(", ")}
                        </span>
                      </td>

                      <td className="p-3 font-semibold">
                        {item.users?.length || 0}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs ${
                            item.status === "posted"
                              ? "bg-green-600"
                              : "bg-yellow-600"
                          }`}
                        >
                          {item.status || "pending"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
