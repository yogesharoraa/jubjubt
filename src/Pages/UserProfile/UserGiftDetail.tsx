import React, { useState, Fragment, useEffect } from 'react';
import WithoutSorttableHeader from '../../Componets/TableComponets/WithoutSorttableHeader';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Listbox, Transition } from '@headlessui/react';
import useApiPost from '../../Hooks/PostData';
import notfound from "/Images/notfound.png";
import { useAppDispatch, useAppSelector } from '../../Hooks/Hooks';
import Loader from "/Images/Loader.gif";
import SimpletextTableBody from '../../Componets/TableComponets/SimpletextTableBody';
import StoryThumbnail from '../../Componets/TableComponets/StoryThumbnail';
import TableDateTimeDisplay from '../../Componets/TableComponets/TableDateTimeDisplay';
import UserGiftDetailPagination from '../../Componets/PaginationComponets/UserGiftDetailPagination';
import { setPaginationUserGiftlList } from '../../Appstore/Slice/PaginationSlice/UserGiftDetailPaginationSlice';


function UserGiftDetail() {
  const transactionOptions = ['All', 'AS RECIEVER', 'AS SENDER'];
  const [transactionType, setTransactionType] = useState(transactionOptions[0]);

  const pagination = useAppSelector((state) => state.UserGiftDetailPaginationSlice);
  const { current_page, records_per_page } = pagination;



  const { loading, error, postData, data } = useApiPost();
  const user_id = sessionStorage.getItem("userIdProfileDetail")


  useEffect(() => {
    const formData = new FormData();
    formData.append("user_id", user_id ?? "");
    formData.append("transaction_table", "coin");
    // formData.append("transaction_type", transactionType);
    if (transactionType === "AS RECIEVER") {
      formData.append("transaction_type", user_id ?? "");
    } else if (transactionType === "AS SENDER") {
      formData.append("transaction_type", user_id ?? "");
    } else {
      formData.append("transaction_type", "");
    }
    formData.append("page", current_page.toString());
    formData.append("pageSize", records_per_page.toString());

    postData("/admin/transaction-history", formData);
  }, [transactionType, current_page, records_per_page]);


  const dispatch = useAppDispatch()


  useEffect(() => {
    if (data?.data?.Pagination) {
      dispatch(setPaginationUserGiftlList(data.data.Pagination));
    }
  }, [data, dispatch]);


  const TotalValues = data?.data?.Records;






  const handleOpenStory = (user: any) => {

  };

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
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-[#f9a866]' : 'text-textcolor'
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
       <div className="  min-w-[1300px] md:min-w-[1100px] w-full">
          {/* Table Header */}
          <div className="flex   bg-headercolortable px-4 py-3 text-left font-medium border-b border-b-bordercolor sm:pl-8">
            <div className="w-[6%]"><WithoutSorttableHeader label="S.L" /></div>
            <div className="w-[10%]"><WithoutSorttableHeader label="COIN" /></div>
            <div className="w-[12%]"><WithoutSorttableHeader label="IMAGE" /></div>
            <div className="w-[10%]"><WithoutSorttableHeader label="GIFT VALUE" /></div>
            <div className="w-[10%]"><WithoutSorttableHeader label="QUANTITY" /></div>
            <div className="w-[20%]"><WithoutSorttableHeader label="CREATED DATE/TIME" /></div>
            <div className="w-[10%]"><WithoutSorttableHeader label="STATUS" /></div>
            <div className="w-[12%]"><WithoutSorttableHeader label="GIFT NAME " /></div>
            <div className="w-[10%]"><WithoutSorttableHeader label="TRANSACTION_REF" /></div>
          </div>


          {/* Table Rows */}
          {loading ? (
            <div className="p-4 h-[38rem] flex justify-center items-center">
              <div className="text-center">

                <img src={Loader} alt="loader" height={50} width={50} />
              </div>
            </div>
          ) : TotalValues?.length > 0 ? (
            TotalValues?.map((user: any, index: number) => (
              <div
                key={user.transaction_id}
                className={`flex items-center px-4 py-3 border-b border-b-bordercolor      ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                        } sm:pl-8`}
              >
                <div className="w-[6%] text-sm font-poppins text-textcolor ">
                  {(current_page - 1) * records_per_page + index + 1}
                </div>
                <div className=' w-[10%]'>
                  <SimpletextTableBody title={user.coin} />
                </div>

                <div className='w-[12%] '>
                  <StoryThumbnail
                    url={user.Gift.gift_thumbnail}
                    storyId={user.Gift.gift_id}
                    onClick={() => handleOpenStory(user)}
                  />
                </div>
                <div className=' w-[10%]'>
                  <SimpletextTableBody title={user.gift_value} />
                </div>
                <div className=' w-[10%]'>
                  <SimpletextTableBody title={user.quantity} />
                </div>

                <div className=' w-[20%]'>
                  <TableDateTimeDisplay dateString={user.updatedAt} />
                </div>
                <div className=' w-[10%]'>
                  <SimpletextTableBody title={user.success} />
                </div>
                <div className=' w-[12%]'>
                  <SimpletextTableBody title={user.Gift.name} />
                </div>
                <div className=' w-[10%]'>
                  <SimpletextTableBody title={user.transaction_ref} />
                </div>

              </div>
            ))
          ) : (
            <div className="p-4 h-[38rem] flex justify-center items-center">
              <div className="w-full flex flex-col items-center h-full justify-center">
                <img
                  src={notfound}
                  alt="Not Found"
                  className="w-1/2 max-h-[40vh] object-contain"
                />
                <h2 className="font-poppins text-lg text-textcolor  mt-4">
                  Don't have any data to show
                </h2>
              </div>
            </div>
          )}

        </div>
        <UserGiftDetailPagination />
      </div>
    </div>
  );
}

export default UserGiftDetail;
