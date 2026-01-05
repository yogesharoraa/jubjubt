"use client";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { MdOutlineCheck, MdOutlineChevronRight } from "react-icons/md";
import { UsegetGiftCategoryValues } from "../../Appstore/Api/Gift/UsegetGiftCategoryValues";
import { useAppSelector } from "../../Hooks/Hooks";
import { toggleCategorySelection } from "../../Appstore/Slice/CategorySelectedIDandValues";

interface CategoryDropdownProps {
    required?: boolean;
}

const GiftCategoryDropdwon: React.FC<CategoryDropdownProps> = () => {
    const dispatch = useDispatch();
    const { data , refetch } = UsegetGiftCategoryValues();

    const giftId = useAppSelector((state) => state.giftUpdate.gift?.gift_category_id);




    console.log("giftId" ,giftId)

    useEffect(()=>{
        refetch()
    },[])


    const selectedCategory = useAppSelector((state) => state.category.selectedCategory);



    const categories =
        data?.data.Records.map((item) => ({
            id: item.gift_category_id,
            category_name: item.name,
        })) || [];

    const [searchValue, setSearchValue] = useState<string>("");
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [rotate, setRotate] = useState<boolean>(false);

    // Set default selected category based on gift data (when editing)
    useEffect(() => {
        if (giftId && categories.length > 0 && !selectedCategory) {
            const foundCategory = categories.find((cat) => cat.id === giftId);
            if (foundCategory) {
                dispatch(toggleCategorySelection({ category_name: foundCategory.category_name, id: foundCategory.id }));
            }
        }
    }, [giftId, categories, dispatch, selectedCategory]);

    useEffect(() => {
        if (selectedCategory) {
            setSearchValue(selectedCategory.category_name);
        } else {
            setSearchValue("");
        }
    }, [selectedCategory]);

    const handleSelectCategory = (categoryName: string, categoryId: number) => {
        dispatch(toggleCategorySelection({ category_name: categoryName, id: categoryId }));
    };

    const handleFocus = () => {
        setShowDropdown(true);
        setRotate(true);
    };

    const handleBlur = () => {
        setTimeout(() => {
            setShowDropdown(false);
            setRotate(false);
        }, 100);
    };

    const handleToggle = () => {
        setShowDropdown((prev) => !prev);
        setRotate((prev) => !prev);
    };

    const isSelected = (id: number) => selectedCategory?.id === id;

    return (
        <div className="w-full flex flex-col relative h-full">
            <label
                htmlFor="category"
                className="font-poppins text-sm font-medium text-textcolor"
            >
                Gift Category
                <span className="text-[#F21818] pl-[1px]">*</span>
            </label>

            <div className="relative mt-2 flex items-center cursor-pointer">
                <input
                    type="text"
                    id="category"
                    name="category"
                    autoComplete="off"
                    spellCheck="false"
                    readOnly
                    className="w-full rounded-lg border cursor-pointer border-bordercolor text-textcolor  bg-primary px-4 py-2.5 my-1 placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-textcolor placeholder:opacity-50 focus:outline-none focus:ring-1 focus:ring-header"
                    placeholder="Select Categories"
                    value={searchValue}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                <div
                    className={`absolute right-2 text-xl cursor-pointer transition-transform ${rotate ? "rotate-90" : "-rotate-90"}`}
                    onClick={handleToggle}
                >
                    <MdOutlineChevronRight className="text-xl" />
                </div>
            </div>

            {selectedCategory && (
                <div className="flex flex-wrap mt-2 gap-2">
                    <span className="flex items-center cursor-pointer bg-gray-200 text-textcolor px-3 py-1 rounded-full text-sm font-poppins">
                        {selectedCategory.category_name}
                        <button
                            className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                            onClick={() => handleSelectCategory(selectedCategory.category_name, selectedCategory.id)}
                        >
                            ×
                        </button>
                    </span>
                </div>
            )}

            {showDropdown && (
                <ul className="absolute top-[5.9rem] left-0 w-full bg-primary text-textcolor rounded-lg shadow-lg max-h-[200px] overflow-y-auto z-10 border border-bordercolor mt-1">
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <li
                                key={cat.id}
                                className="px-4 py-2 cursor-pointer font-poppins hover:bg-gray-200 text-textcolor flex justify-between items-center"
                                onMouseDown={() =>
                                    handleSelectCategory(cat.category_name, cat.id)
                                }
                            >
                                {cat.category_name}
                                {isSelected(cat.id) && (
                                    <MdOutlineCheck className="text-[#6565657a] text-lg" />
                                )}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2 font-poppins text-center text-gray-500">
                            No categories found
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default GiftCategoryDropdwon;
