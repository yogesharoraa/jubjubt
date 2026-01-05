
function formatDate(utcString) {
    if (!utcString) return "Invalid Date";

    const utcDate = new Date(utcString);
    if (isNaN(utcDate.getTime())) return "Invalid Date";

    return utcDate.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
    }); // Example: "December 09, 2024"
}
export default formatDate
