/*
    This file is part of WeightLog.

    WeightLog is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WeightLog is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WeightLog.  If not, see <https://www.gnu.org/licenses/>.
 */
import React, {useCallback, useContext, useEffect, useState} from "react";
import Layout from "../../components/layout";
import {Box, Button, CircularProgress, Dialog, DialogActions, DialogTitle, Fab, IconButton, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useTranslation} from "react-i18next";
import {WorkoutContext} from "../../context/workoutContext";
import StopIcon from '@mui/icons-material/Stop';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {SettingsContext} from "../../context/settingsContext";
import {TimerContext} from "../../context/timerContext";
import {VolumeMute, VolumeUp} from "@mui/icons-material";

export const Rest = (props: { onBack: () => void }) => {
    const {onBack} = props;
    const {t} = useTranslation();
    const {
        restStarted,
        restTime,
        setRestTime,
        stopRest,
        focusedExercise,
        currentSet
    } = useContext(WorkoutContext);
    const {time, audioContext} = useContext(TimerContext);
    const {useLbs, sound, saveSound} = useContext(SettingsContext);
    const moreTime = useCallback(() => {
        if (!restTime || !setRestTime) {
            return;
        }
        setRestTime(Math.max(restTime + 10, 0));
    }, [restTime, setRestTime]);
    const lessTime = useCallback(() => {
        if (!restTime || !setRestTime) {
            return;
        }
        setRestTime(Math.max(restTime - 10, 0));
    }, [restTime, setRestTime]);

    const currentRestTime = restStarted ? Math.max(restTime - (Date.now() - restStarted?.getTime()) / 1000, 0) : 0;
    const curSecs = Math.floor(currentRestTime);
    const [stopDialogOpen, setStopDialogOpen] = useState(false);

    const playBeep = (frequency: number, time: number) => {
        try {
            if (!audioContext) return;
            const oscillator = audioContext.createOscillator();
            oscillator.type = "triangle";
            oscillator.frequency.value = frequency;
            oscillator.connect(audioContext.destination);
            oscillator.start();
            setTimeout(function () {
                oscillator.stop();
            }, time);
        } finally {}
    }

    useEffect(() => {
        if (curSecs <= 5 && sound) {
            playBeep(500, 250);
        }
    }, [curSecs]);

    useEffect(() => {
        if (currentRestTime <= 0 && stopRest) {
            stopRest();
            if (sound) playBeep(1000, 1000);
        }
    }, [currentRestTime, time, stopRest]);

    return <Layout title={t("rest")} hideNav onBack={onBack} toolItems={<IconButton onClick={() => { if (saveSound) saveSound(!sound) }}>{sound ? <VolumeUp /> : <VolumeMute />}</IconButton>}>
        <Box sx={{height: "100%", display: "flex", flexDirection: "column"}}>
            <Box sx={{flexGrow: 1}}/>
            <CircularProgress variant="determinate" value={currentRestTime * 100 / restTime}
                              sx={{alignSelf: "center", margin: "12px"}} size="8rem"/>
            <Typography variant="h1" sx={{alignSelf: "center"}}>
                {curSecs} s
            </Typography>
            <Typography variant="h5" sx={{alignSelf: "center", textAlign: "center", color: "rgb(192, 192, 192)"}}>
                {focusedExercise?.name}
            </Typography>
            {currentSet && currentSet.weight &&
                <Typography variant="h5" sx={{alignSelf: "center", textAlign: "center", color: "rgb(192, 192, 192)"}}>
                    {t("weight")}: {currentSet?.weight} {useLbs ? "lbs" : "kg"}
                </Typography>}
            <Box sx={{flexGrow: 1}}/>
            <Stack direction="row" spacing={{xs: 1, sm: 2, md: 4}} sx={{alignSelf: "center", marginBottom: "24px"}}>
                <Fab color="primary" aria-label="add" onClick={lessTime}>
                    <RemoveIcon/>
                </Fab>
                <Fab color="error" aria-label="stop" onClick={() => setStopDialogOpen(true)}>
                    <StopIcon/>
                </Fab>
                <Fab color="primary" aria-label="add" onClick={moreTime}>
                    <AddIcon/>
                </Fab>
            </Stack>
            <Dialog
                open={stopDialogOpen}
                onClose={() => setStopDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {t("stopRest")}?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setStopDialogOpen(false)} autoFocus>
                        {t("no")}
                    </Button>
                    <Button onClick={() => {
                        if (stopRest) stopRest();
                        setStopDialogOpen(false)
                    }}>{t("yes")}</Button>
                </DialogActions>
            </Dialog>

        </Box>
    </Layout>
}
