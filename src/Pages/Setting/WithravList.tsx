import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import currencyvaluess from "currency-codes";
import getSymbolFromCurrency from "currency-symbol-map";
import Apimethod from "../../Hooks/Apimethod";
import InputField from "../../Componets/InputField";
import useApiPost from "../../Hooks/PostData";

function WithravList() {
  const { data, postData } = useApiPost();
  const IS_DEMO = import.meta.env.VITE_IS_DEMO === "true";
  const { loading, makeRequest } = Apimethod();

  const [transactionId, setTransactionId] = useState<string | number | null>(null);

  const [formData, setFormData] = useState({
    currency: "",
    coin_value_per_1_currency: "",
    tax: "",
    admin_margin: "",
    minimum_transaction: "",
    welcome_bonus: "",
  });

  const [isEdited, setIsEdited] = useState(false);
  const [editedFields, setEditedFields] = useState({
    currency: false,
    coin_value_per_1_currency: false,
    tax: false,
    admin_margin: false,
    minimum_transaction: false,
    welcome_bonus: false,
  });

  useEffect(() => {
    const formValues = new FormData();
    formValues.append("transaction_type", "withdrawal");
    postData("/transaction/transaction_conf", formValues);
  }, []);

  useEffect(() => {
    const record = data?.data?.Records?.[0];
    if (record) {
      setTransactionId(record.transaction_conf_id);
      setFormData({
        currency: record.currency || "",
        coin_value_per_1_currency: record.coin_value_per_1_currency || "",
        tax: record.tax || "",
        admin_margin: record.admin_margin || "",
        minimum_transaction: record.minimum_transaction?.toString() || "",
        welcome_bonus: record.welcome_bonus || "",
      });
    }
  }, [data]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updatedForm = { ...prev, [field]: value };
      if (prev[field as keyof typeof prev] !== value) {
        setIsEdited(true);
        setEditedFields((prev) => ({ ...prev, [field]: true }));
      }
      return updatedForm;
    });
  };

  const handleWithravListUpdate = async () => {
    if (IS_DEMO) {
      toast.error("This action is disabled in the demo version.");
      return;
    }

    const updatedFormData = new FormData();

    if (!transactionId) {
      toast.error("Transaction ID not found.");
      return;
    }

    updatedFormData.append("transaction_conf_id", transactionId.toString());
    updatedFormData.append("transaction_type", "withdrawal");

    for (const key in editedFields) {
      if (editedFields[key as keyof typeof editedFields]) {
        updatedFormData.append(key, formData[key as keyof typeof formData]);
      }
    }

    if ([...updatedFormData.entries()].length <= 2) {
      toast.info("No changes to update.");
      return;
    }

    // ✅ Add currency symbol based on selected currency code
    const selectedCurrency = currencyvaluess.data.find(
      (item) => item.code === formData.currency
    );

    if (selectedCurrency) {
      const symbol = getSymbolFromCurrency(selectedCurrency.code) || "";
      updatedFormData.append("currency_symbol", symbol);

      // Optional: Store in session
      sessionStorage.setItem("currencyvalues", selectedCurrency.code);
      sessionStorage.setItem("currency_symbol", symbol);
    }

    try {
      const response = await makeRequest(
        "/admin/update-transaction-conf",
        updatedFormData,
        undefined,
        "POST"
      );

      toast.success(response.message || "Updated successfully");
      setIsEdited(false);
      setEditedFields({
        currency: false,
        coin_value_per_1_currency: false,
        tax: false,
        admin_margin: false,
        minimum_transaction: false,
        welcome_bonus: false,
      });
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <>
      <h2 className="text-textcolor font-semibold mt-4 md:mt-0 font-poppins text-xl pb-4">
        Finance Setup
      </h2>

      <div className="border md:w-full border-bordercolor rounded-lg px-6 pt-8 mt-5 md:mt-0">
        <div className="grid w-full gap-4 md:grid-cols-2">
          {/* Currency Dropdown */}
          <div className="flex w-[15rem] md:w-full flex-col gap-2">
            <label className="text-textcolor font-poppins font-semibold text-sm">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="border border-bordercolor px-4 py-3 rounded-md bg-transparent text-textcolor"
            >
              <option value="" disabled>
                Select currency
              </option>
              {currencyvaluess.data.map((currency) => {
                const symbol = getSymbolFromCurrency(currency.code);
                return (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.currency}
                    {symbol ? ` (${symbol})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Coin Value */}
          <InputField
            label="Coin Value Per Currency (e.g. $1 = 100 coins)"
            value={formData.coin_value_per_1_currency}
            placeholder="Enter Coin Value Per Currency"
            onChange={(e) =>
              handleChange("coin_value_per_1_currency", e.target.value)
            }
          />

          {/* Minimum Transaction */}
          <InputField
            label="Minimum Coin Withdrawal Transaction Request"
            value={formData.minimum_transaction}
            placeholder="Enter Minimum Coin Withdrawal Transaction Request"
            onChange={(e) => handleChange("minimum_transaction", e.target.value)}
          />

          {/* Welcome Bonus */}
          <InputField
            label="Welcome Bonus Coin on Register"
            value={formData.welcome_bonus}
            placeholder="Enter welcome bonus"
            onChange={(e) => handleChange("welcome_bonus", e.target.value)}
          />
        </div>

        <div className="flex justify-center py-6 place-items-center">
          <button
            className={`px-24 py-3 font-medium text-white rounded-xl cursor-pointer ${isEdited ? "bggradient" : "bggradient opacity-50"
              }`}
            onClick={handleWithravListUpdate}
            disabled={loading}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
}

export default WithravList;
