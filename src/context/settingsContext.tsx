import React, {ReactElement, useCallback, useState} from "react";
import {OneRm} from "../utils/oneRm";

export interface ISettingsContext {
    showRpe: boolean;
    showRir: boolean;
    useLbs: boolean;
    oneRm: OneRm;
    saveRpe?: (value: boolean) => void;
    saveRir?: (value: boolean) => void;
    saveLbs?: (value: boolean) => void;
    saveOneRm?: (value: OneRm) => void;
}

export const SettingsContext = React.createContext({
    showRpe: true,
    showRir: true,
    useLbs: false,
    oneRm: OneRm.EPLEY
} as ISettingsContext);

export const SettingsContextProvider = (props: { children: ReactElement }) => {
    const {children} = props;
    const [rpe, setRpe] = useState(localStorage.getItem("showRpe") !== "false");
    const [rir, setRir] = useState(localStorage.getItem("showRir") !== "false");
    const [lbs, setLbs] = useState(localStorage.getItem("useLbs") === "true");
    const [oneRm, setOneRm] = useState(parseInt(localStorage.getItem("oneRm") || "0"));
    const saveRpe = useCallback((value: boolean) => {
        localStorage.setItem("showRpe", value ? "true" : "false");
        setRpe(value);
    }, []);
    const saveRir = useCallback((value: boolean) => {
        localStorage.setItem("showRir", value ? "true" : "false");
        setRir(value);
    }, []);
    const saveLbs = useCallback((value: boolean) => {
        localStorage.setItem("useLbs", value ? "true" : "false");
        setLbs(value);
    }, []);
    const saveOneRm = useCallback((value: OneRm) => {
        localStorage.setItem("oneRm", value.toString(10));
        setOneRm(value);
    }, [])
    const settings = {
        showRpe: rpe,
        showRir: rir,
        useLbs: lbs,
        oneRm: oneRm,
        saveRpe,
        saveRir,
        saveLbs,
        saveOneRm
    }
    return <SettingsContext.Provider value={settings}>
        {children}
    </SettingsContext.Provider>
}