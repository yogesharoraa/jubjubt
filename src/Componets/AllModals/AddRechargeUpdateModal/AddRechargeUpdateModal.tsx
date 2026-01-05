import { Dialog, DialogPanel } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import useApiPost from "../../../Hooks/PostData";
import { toast } from "react-hot-toast";
import { setTrue } from "../../../Appstore/Slice/toggleSlice";
import { useEffect, useState } from "react";
import ModalHeader from "../ModalHeader";

function AddRechargeUpdateModal() {
    const modalData = useAppSelector((state) => state.modals.AddRechargeUpdateModal);
    const dispatch = useAppDispatch();


    const planvalues = useAppSelector((state) => state.plan.plan)


    const [planName, setPlanName] = useState(planvalues?.plan_name || "");
    const [coins, setCoins] = useState(planvalues?.coins || "");
    const [money, setMoney] = useState(planvalues?.corresponding_money || "");

    const { data, loading, error, postData } = useApiPost();

    const close = () => {
        dispatch(hideModal("AddRechargeUpdateModal"));
    };


    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';



    const currencyvalues = sessionStorage.getItem("currencyvalues")

    const currency_symbol = sessionStorage.getItem("currency_symbol")

    const handleSubmit = async () => {
        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }

        if (!planName || !coins || !money) {
            toast.error("Please fill all required fields.");
            return;
        }

        const formData = new FormData();
        formData.append("plan_name", planName);
        formData.append("coins", coins);
        formData.append("corresponding_money", money);
        formData.append("transaction_type", "recharge")
        formData.append("currency", currencyvalues || "")
        formData.append("currency_symbol", currency_symbol || "")
        formData.append("plan_id", planvalues?.plan_id ? String(planvalues.plan_id) : "")

        try {
            const response = await postData("/admin/update-transaction-plan", formData, "multipart/form-data");

            if (response?.message === "hashTags Already Exist") {
                toast.error("Plan already exists.");
                return;
            }

            if (response?.status) {
                toast.success("Recharge plan added successfully!");
                close();
                dispatch(setTrue());
            } else {
                toast.error("Something went wrong while uploading.");
            }
        } catch (err) {
            toast.error("Something went wrong while uploading.");
        }
    };

    const inputClass =
        "w-full rounded-lg border border-bordercolor bg-primary text-textcolor px-4 py-2.5 my-1 placeholder:text-sm focus:outline-none focus:ring-1 focus:ring-header";

    return (
        <Dialog open={modalData} onClose={close} as="div" className="z-50">
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <DialogPanel className="w-[90%] max-w-md sm:max-w-lg bg-primary border border-bordercolor rounded-2xl shadow-xl">
                    <ModalHeader title="Update Recharge Plan" onClose={close} />

                    <div className="w-full grid gap-3 px-4 pb-4 mt-8">
                        <div className="flex flex-col gap-2">
                            <label className="font-poppins text-sm font-medium text-textcolor">
                                Plan Name <span className="text-[#F21818]">*</span>
                            </label>
                            <input
                                type="text"
                                value={planName}
                                onChange={(e) => setPlanName(e.target.value)}
                                placeholder="Enter Plan Name"
                                className={inputClass}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-poppins text-sm font-medium text-textcolor">
                                Coins <span className="text-[#F21818]">*</span>
                            </label>
                            <input
                                type="text"
                                value={coins}
                                onChange={(e) => setCoins(e.target.value)}
                                placeholder="Enter number of coins"
                                className={inputClass}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-poppins text-sm font-medium text-textcolor">
                                Plan Price <span className="text-[#F21818]">*</span>
                            </label>
                            <input
                                type="text"
                                value={money}
                                onChange={(e) => setMoney(e.target.value)}
                                placeholder="Enter Plan Price"
                                className={inputClass}
                            />
                        </div>


                        <div className="flex justify-center items-center">
                            <button
                                disabled={loading}
                                onClick={handleSubmit}
                                className="px-10 py-2 rounded-xl bggradient cursor-pointer font-poppins text-white disabled:opacity-50"
                            >
                                {loading ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default AddRechargeUpdateModal;
