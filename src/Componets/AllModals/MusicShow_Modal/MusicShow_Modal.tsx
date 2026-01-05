import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css"; // Import audio player styles

function MusicShow_Modal() {
    const modalData = useAppSelector((state) => state.modals.MusicShow_Modal);
    const dispatch = useAppDispatch();

    const close = () => {
        dispatch(hideModal("MusicShow_Modal"));
    };

    const Musicurl = sessionStorage.getItem("Musicurl")
    // ✅ URL replace करें
    let finalMusicUrl = Musicurl;
    if (Musicurl && Musicurl.includes('cloudfront.net')) {
        finalMusicUrl = Musicurl.replace(
            'https://d1yb64k1jgx7ak.cloudfront.net/', 
            'https://reelboost.s3.us-east-1.amazonaws.com/'
        );
    }

    return (
        <Transition appear show={modalData} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={close}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                {/* Modal Panel */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-semibold leading-6 text-gray-900 dark:text-white text-center"
                                >
                                    Now Playing
                                </Dialog.Title>

                                <div className="mt-4">
                                    <AudioPlayer
                                        autoPlay
                                        src={finalMusicUrl  || ""}
                                        onPlay={() => console.log("onPlay")}
                                        layout="stacked-reverse"
                                        showJumpControls={false}
                                        className="rounded-md"
                                    />
                                </div>

                                <div className="mt-6">
                                    <button
                                        type="button"
                                        className="w-full inline-flex  cursor-pointer justify-center rounded-md border  bggradient px-4 py-2 text-sm font-medium text-white  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        onClick={close}
                                    >
                                        Close
                                    </button>
                                </div>
                            </DialogPanel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default MusicShow_Modal;
