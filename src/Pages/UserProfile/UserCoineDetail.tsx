import React, { useState, Fragment, useEffect } from 'react';
import WithoutSorttableHeader from '../../Componets/TableComponets/WithoutSorttableHeader';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Listbox, Transition } from '@headlessui/react';
import useApiPost from '../../Hooks/PostData';
import notfound from "/Images/notfound.png";
import { useAppDispatch, useAppSelector } from '../../Hooks/Hooks';
import Loader from "/Images/Loader.gif";
import SimpletextTableBody from '../../Componets/TableComponets/SimpletextTableBody';
import UserDetailTransationPagination from '../../Componets/PaginationComponets/UserDetailTransationPagination';
import { setPaginationUserTransationDetaillList } from '../../Appstore/Slice/PaginationSlice/UserTransationDetailPaginationSlice';
function UserCoineDetail() {
    const transactionOptions = ['All', 'Withdrawal', 'Recharge'];
    const [transactionType, setTransactionType] = useState(transactionOptions[0]);
    const pagination = useAppSelector((state) => state.UserTransationDetailPaginationSlice);
    const { current_page, records_per_page } = pagination;

    const { loading, error, postData, data } = useApiPost();
    const user_id = sessionStorage.getItem("userIdProfileDetail")


    useEffect(() => {
        const formData = new FormData();
        formData.append("user_id", user_id ?? "");
        formData.append("transaction_table", "money");
        // formData.append("transaction_type", transactionType);

        if (transactionType === "All") {

        } else if (transactionType === "Recharge") {
            formData.append("transaction_type", "recharge");
        }
        else if (transactionType === "Withdrawal") {
            formData.append("transaction_type", "withdraw");
        }
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
        postData("/admin/transaction-history", formData);
    }, [transactionType, current_page, records_per_page]);



    const TotalValues = data?.data?.Records;

    const dispatch = useAppDispatch()


    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationUserTransationDetaillList(data.data.Pagination));
        }
    }, [data, dispatch]);





    return (
        <div className="py-4  px-6 xl:px-40">
            <div className="w-full flex justify-end items-end">
                <div className="flex space-x-4">
                    {/* Transaction Type Dropdown */}
                    <div className=" w-[150px]">
                        <Listbox value={transactionType} onChange={setTransactionType}>
                            <div className="relative">
                                <Listbox.Button className="relative w-full  rounded-md cursor-pointer bg-primary text-textcolor py-2 pl-3 pr-10 text-left text-sm border border-bordercolor shadow-sm ">
                                    <span className="block truncate">{transactionType}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Listbox.Button>
                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute z-10 mt-1  cursor-pointer max-h-60 w-full overflow-auto rounded-md bg-primary  text-textcolor py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                                        {transactionOptions.map((type) => (
                                            <Listbox.Option
                                                key={type}
                                                className={({ active }) =>
                                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-[#f9a866]' : ' text-textcolor'
                                                    }`
                                                }
                                                value={type}
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                            {type}
                                                        </span>
                                                        {selected && (
                                                            <span className="absolute inset-y-0 left-2 flex items-center text-[#f9a866]">
                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto rounded-lg border border-bordercolor mt-6">
                <div className="min-w-[1000px] w-full">
                    {/* Table Header */}
                    <div className="flex bg-headercolortable px-4 py-3 text-left font-medium border-b border-b-bordercolor sm:pl-8">
                        <div className="w-[10%] min-w-[80px]"><WithoutSorttableHeader label="S.L" /></div>
                        <div className="w-[20%] min-w-[120px]"><WithoutSorttableHeader label="PRICE / COIN" /></div>
                        <div className="w-[20%] min-w-[120px]"><WithoutSorttableHeader label="PAST COIN" /></div>
                        <div className="w-[20%] min-w-[150px]"><WithoutSorttableHeader label="PAYMENT METHOD" /></div>
                        <div className="w-[10%] min-w-[100px]"><WithoutSorttableHeader label="STATUS" /></div>
                        <div className="w-[10%] min-w-[100px]"><WithoutSorttableHeader label="AMOUNT" /></div>
                        <div className="w-[10%] min-w-[100px]"><WithoutSorttableHeader label="TYPES" /></div>
                    </div>

                    {/* Table Rows */}
                    {loading ? (
                        <div className="p-4 h-[38rem] flex justify-center items-center">
                            <img src={Loader} alt="loader" className="h-12 w-12" />
                        </div>
                    ) : TotalValues?.length > 0 ? (
                        TotalValues.map((user: any, index: number) => (
                            <div
                                key={user.transaction_id}
                                className={`flex items-center px-4 py-3 border-b border-b-bordercolor ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'} sm:pl-8`}
                            >
                                <div className="w-[10%] min-w-[80px] text-sm font-poppins text-textcolor">
                                    {(current_page - 1) * records_per_page + index + 1}
                                </div>

                                <div className="w-[20%] min-w-[120px]"><SimpletextTableBody title={user.acutal_money} /></div>
                                <div className="w-[20%] min-w-[120px]"><SimpletextTableBody title={user.past_coin} /></div>
                                <div className="w-[20%] min-w-[150px]"><SimpletextTableBody title={user.payment_method} /></div>
                                <div className="w-[10%] min-w-[100px]"><SimpletextTableBody title={user.success} /></div>
                                <div className="w-[10%] min-w-[100px]"><SimpletextTableBody title={user.coin_price} /></div>
                                <div className="w-[10%] min-w-[100px]"><SimpletextTableBody title={user.transaction_type} /></div>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 h-[38rem] flex justify-center items-center">
                            <div className="w-full flex flex-col items-center h-full justify-center">
                                <img src={notfound} alt="Not Found" className="w-1/2 max-h-[40vh] object-contain" />
                                <h2 className="font-poppins text-lg text-textcolor mt-4">
                                    Don't have any data to show
                                </h2>
                            </div>
                        </div>
                    )}
                </div>

                <UserDetailTransationPagination />
            </div>

        </div>
    );
}

export default UserCoineDetail;
