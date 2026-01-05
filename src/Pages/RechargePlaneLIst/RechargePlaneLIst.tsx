import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SearchBar from "../../Componets/SearchBar/SearchBar";
import WithoutSorttableHeader from "../../Componets/TableComponets/WithoutSorttableHeader";
import useApiPost from "../../Hooks/PostData";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import SimpletextTableBody from "../../Componets/TableComponets/SimpletextTableBody";
import notfound from "/Images/notfound.png";
import Loader from "/Images/Loader.gif";
import TableDateTimeDisplay from "../../Componets/TableComponets/TableDateTimeDisplay";
import TableActionButtons from "../../Componets/TableComponets/TableActionButtons";
import toast from "react-hot-toast";
import EditIcon from "/Images/edit.png";
import BlockIcon from "/Images/deleteicon.png";
import AddIcon from "/Images/add.png";
import { showModal } from "../../Appstore/Slice/ModalSlice";
import { reset } from "../../Appstore/Slice/toggleSlice";
import RecharPlanListPagination from "../../Componets/PaginationComponets/RecharPlanListPagination";
import { setPaginationRechargePlanlList } from "../../Appstore/Slice/PaginationSlice/RechargePlanListPaginationSlice";
import Apimethod from "../../Hooks/Apimethod";
import { fetchPlanSuccess } from "../../Appstore/Slice/planSlice";

function RechargePlanList() {

    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

    const dispatch = useAppDispatch();
    const isSidebarOpen = useSelector((state) => state.sidebar.isOpen);
    const { data, loading, postData } = useApiPost();
    const pagination = useAppSelector((state) => state.RechargePlanListPaginationSlice);
    const { current_page, records_per_page } = pagination;
    const [toggleStates, setToggleStates] = useState({});
    const { makeRequest } = Apimethod();

    const { postData:reelboost } = useApiPost();


     console.log("records_per_page!!!" ,current_page)

    console.log("paginationpaginationpagination" ,pagination)



    //  get curreny code values from another api 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const formdata12 = new FormData();
                formdata12.append("transaction_type", "withdrawal");
                const response = await reelboost("/transaction/transaction_conf", formdata12, "multipart/form-data");
                console.log("Response:monu from lisyt", response?.data?.Records[0]?.currency);
                sessionStorage.setItem("currencyvalues", response?.data?.Records[0]?.currency)
                sessionStorage.setItem("currency_symbol", response?.data?.Records[0]?.currency_symbol)
            } catch (error) {
                console.error("Error during transaction:", error);
            }
        };

        fetchData();
    }, []);



    useEffect(() => {
        const formData = new FormData();
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
        formData.append("sort_order", "DESC")
        postData("/transaction/get-transaction-plan", formData);
    }, [current_page, records_per_page]);



    const isapicall = useAppSelector((state) => state.toggle.value)


    useEffect(() => {
        if (isapicall) {
            const formData = new FormData();
            postData("/transaction/get-transaction-plan", formData);
        }
    }, [isapicall])

    // Update pagination state from API response
    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationRechargePlanlList(data.data.Pagination));
        }
    }, [ dispatch , data]);

    // Set default toggle states
    useEffect(() => {
        if (data?.data?.Records) {
            const toggles = data.data.Records.reduce((acc, record) => {
                acc[record.plan_id] = record.status ?? false;
                return acc;
            }, {});
            setToggleStates(toggles);
        }
    }, [  dispatch , data ]);

    const handleToggleStatus = async (planId) => {
        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        const newStatus = !toggleStates[planId];
        try {
            await makeRequest("/admin/update-transaction-plan", { plan_id: planId, status: newStatus }, "application/json", "POST");
            setToggleStates((prev) => ({ ...prev, [planId]: newStatus }));
            toast.success("Plan status updated");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleAddRecharge = () => {
        
        dispatch(showModal("AddRechargeModal"));
        dispatch(reset());
    };

    const handleUpdateRecharge = (plan) => {
        
        dispatch(fetchPlanSuccess(plan))
        dispatch(reset());
        dispatch(showModal("AddRechargeUpdateModal"))
    };



    const currencyvalues = sessionStorage.getItem("currencyvalues")

    const records = data?.data?.Records || [];



    console.log("recordsrecords" ,records)

    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">
                {/* Header */}
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="pt-3 text-xl font-semibold text-textcolor font-poppins">Recharge Plan List</h2>
                </div>

                {/* Breadcrumb + Add Button */}
                <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard">
                            <h3 className="text-base font-semibold text-[#3A3A3A] font-poppins">Dashboard</h3>
                        </Link>
                        <div className="h-1 w-1 rounded-full bg-[#E0E0E0]" />
                        <h3 className="text-base text-[#858585] font-poppins">Recharge Plan List</h3>
                    </div>
                    <button onClick={handleAddRecharge} className="flex gap-1.5 mr-1 py-2 px-4   cursor-pointer font-poppins font-medium text-white rounded-md bggradient">
                        <img src={AddIcon} className="w-4 h-4" alt="Add" />
                        <p className="md:text-sm text-xs">Add Recharge Plan</p>
                    </button>
                </div>

                {/* Table */}
                <div className="mt-6 w-full overflow-x-auto rounded-lg border border-bordercolor">
                    <div className="min-w-[1200px]">
                        {/* Table Header */}
                        <div className="flex px-4 py-3 text-left border-b w-full bg-headercolortable border-b-bordercolor sm:pl-8">
                            {['S.L', 'PLAN NAME', 'COIN', 'CREATED DATE/TIME', 'PLAN PRICE', 'CURRENCY', 'STATUS', 'ACTIONS'].map((label, i) => (
                                <div key={i} className={`w-[${[5, 20, 15, 15, 10, 15, 10, 10][i]}%]`}><WithoutSorttableHeader label={label} /></div>
                            ))}
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="p-4 h-[38rem] flex justify-center items-center">
                                <img src={Loader} alt="Loading..." className="h-10 w-10" />
                            </div>
                        ) : records.length > 0 ? (
                            records.map((plan, index) => (
                                <div key={plan.plan_id} className={`flex items-center px-4 py-3 border-b border-b-bordercolor sm:pl-8 ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'}`}>
                                    <div className="w-[5%] text-sm font-poppins text-textcolor">{(current_page - 1) * records_per_page + index + 1}</div>
                                    <div className="w-[20%]"><SimpletextTableBody title={plan.plan_name} /></div>
                                    <div className="w-[15%]"><SimpletextTableBody title={plan.coins} /></div>
                                    <div className="w-[15%]"><TableDateTimeDisplay dateString={plan.createdAt} /></div>
                                    <div className="w-[10%]"><SimpletextTableBody title={plan.corresponding_money} /></div>

                                    <div className="w-[15%]"><SimpletextTableBody title={currencyvalues || ""} /></div>
                                    <div className="w-[10%]">
                                        <label className="flex items-center cursor-pointer select-none">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={toggleStates[plan.plan_id] || false}
                                                    onChange={() => handleToggleStatus(plan.plan_id)}
                                                    className="sr-only"
                                                />
                                                <div className={`block h-6 w-10 rounded-full border transition duration-300 ${toggleStates[plan.plan_id] ? "border-toggalbtcolorborder bggradient" : "bg-transparent border border-toggalbtcolorborder"}`} />
                                                <div className={`absolute top-1 h-4 w-4 rounded-full transition duration-300 ${toggleStates[plan.plan_id] ? "right-1 bg-white" : "left-1 bggradient"}`} />
                                            </div>
                                        </label>
                                    </div>
                                    <div className="w-[10%] flex gap-2">
                                        <button onClick={() => handleUpdateRecharge(plan)} className="px-[10px] cursor-pointer py-[10px] bg-[#D0CCE1]/60 rounded-full">
                                            <img src={EditIcon} alt="Edit" className="w-4 h-4" />
                                        </button>
                                      
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 h-[38rem] flex justify-center items-center">
                                <div className="flex flex-col items-center">
                                    <img src={notfound} alt="Not Found" className="w-1/2 max-h-[40vh] object-contain" />
                                    <h2 className="font-poppins text-lg text-textcolor mt-4">Don't have any data to show</h2>
                                </div>
                            </div>
                        )}
                    </div>
                    <RecharPlanListPagination />
                </div>
            </div>
        </div>
    );
}

export default RechargePlanList;