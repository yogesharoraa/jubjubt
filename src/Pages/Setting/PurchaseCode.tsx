import toast from "react-hot-toast";
import { showModal } from "../../Appstore/Slice/ModalSlice";
import { useAppDispatch } from "../../Hooks/Hooks";

function PurchaseCode() {
    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';



    const dispatch = useAppDispatch()


    const handlopne = () => {
         if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        dispatch(showModal("DeletePurchasecode"))

    }

    return (
        <div className="border border-bordercolor rounded-lg  px-2 md:px-8 py-6 mt-5 md:mt-0">
            <p className="text-textcolor font-semibold text-base pb-2">Purchase Code</p>
            <input
                type="text"
                value="*************"
                readOnly
                className="border border-bordercolor font-poppins text-textcolor bg-transparent rounded-md w-full py-3 my-1 px-4 placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-textcolor placeholder:opacity-50 focus:outline-none focus:ring-1 focus:ring-[#f9a866]"
            />

            <div className="flex justify-center pt-14 items-center">
                <button

                    className="px-24 py-3 font-medium text-white cursor-pointer rounded-xl bg-[#FF3838] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlopne}
                >
                    Deactivate
                </button>
            </div>
        </div>
    );
}

export default PurchaseCode;
