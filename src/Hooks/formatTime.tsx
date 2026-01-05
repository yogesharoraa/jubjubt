
 function formatTime(utcString) {
    if (!utcString) return "Invalid Time";

    const utcDate = new Date(utcString);
    if (isNaN(utcDate.getTime())) return "Invalid Time";

    return utcDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }); 
}

export default formatTime
