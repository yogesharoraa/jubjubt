import React, { useEffect } from "react";
import useApiPost from "../Hooks/PostData";
import Apimethod from "../Hooks/Apimethod";
import { useAppSelector } from "../Hooks/Hooks";

/** Convert HEX to approximate CSS filter for PNGs */
function hexToCssFilter(hex: string) {
    if (!hex) return "none";
    hex = hex.replace("#", "");
    if (hex.length !== 6) return "none";

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    // Convert RGB to HSL
    const rPct = r / 255;
    const gPct = g / 255;
    const bPct = b / 255;

    const max = Math.max(rPct, gPct, bPct);
    const min = Math.min(rPct, gPct, bPct);
    let h = 0;

    if (max !== min) {
        if (max === rPct) h = (60 * ((gPct - bPct) / (max - min)) + 360) % 360;
        else if (max === gPct) h = (60 * ((bPct - rPct) / (max - min)) + 120) % 360;
        else h = (60 * ((rPct - gPct) / (max - min)) + 240) % 360;
    }

    const brightness = ((r + g + b) / (3 * 255)) * 100 + 50;

    return `invert(0%) sepia(100%) saturate(5000%) hue-rotate(${h}deg) brightness(${brightness}%) contrast(100%)`;
}

export default function ThemeCompo() {


    const isapicall = useAppSelector((state) => state.toggle.value)



    const { loading, error, data, makeRequest } = Apimethod();

    useEffect(() => {
        makeRequest("/project_conf", null, undefined, "GET");
    }, []);


    useEffect(() => {
        if (isapicall) {
            makeRequest("/project_conf", null, undefined, "GET");
        }
    },[isapicall])


    useEffect(() => {
        // pick color from either getData or postDataRes
        const colorHex = data?.data?.app_primary_color || data?.data?.app_primary_color;
        if (!colorHex) return;

        document.documentElement.style.setProperty("--color-maincolor", colorHex);
        document.documentElement.style.setProperty("--gradient-color", colorHex);
        document.documentElement.style.setProperty("--color-filter", hexToCssFilter(colorHex));
    }, [data]);

    return <div />;
}
