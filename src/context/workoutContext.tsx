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
import React, {ReactElement, useCallback, useContext, useEffect, useState} from "react";
import {ExerciseSet, Workout, WorkoutExercise, WorkoutHistory} from "../models/workout";
import {Exercise} from "../models/exercise";
import {DBContext} from "./dbContext";
import {useTranslation} from "react-i18next";
import getId from "../utils/id";
import {PB} from "../models/pb";
import {compareSetHistoryEntries} from "../utils/comparators";
import {getOneRm} from "../utils/oneRm";
import {SettingsContext} from "./settingsContext";
import {TimerContext} from "./timerContext";
import defer from "../utils/defer";

export interface Superset {
    size: number;
    current: number;
}

interface IWorkoutContext {
    timeStarted?: Date;
    timeUpdated: Date;
    followingWorkout?: Workout;
    workoutExercises?: WorkoutExercise[];
    currentWorkout?: Workout;
    currentSet?: ExerciseSet;
    currentSetNumber: number;
    restStarted?: Date;
    restTime: number;
    currentWorkoutHistory?: WorkoutHistory;
    currentWorkoutExercise?: WorkoutExercise;
    currentWorkoutExerciseIds?: number[];
    storedExercises: Record<number, number>;
    currentWorkoutExerciseNumber: number;
    setCurrentWorkout?: (currentWorkout?: Workout) => void;
    setCurrentSet?: (currentSet?: ExerciseSet) => void;
    setCurrentSetNumber?: (currentSetNumber: number) => void;
    setCurrentWorkoutExercise?: (currentWorkoutExercise?: WorkoutExercise) => void;
    setCurrentWorkoutExerciseNumber?: (currentWorkoutExerciseNumber: number) => void;
    setShowWorkoutFinishedPage?: (value: boolean) => void;
    focusedExercise?: Exercise;
    startWorkout?: (followingWorkout?: Workout) => Promise<void>;
    stopWorkout?: () => Promise<void>;
    saveSet?: (set: ExerciseSet) => Promise<void>;
    startRest?: (rest: number) => void;
    stopRest?: () => void;
    setRestTime?: (rest: number) => void;
    setFocusedExercise?: (exercise: Exercise) => void;
    showWorkoutFinishedPage: boolean;
    addSet?: () => void;
    removeSet?: () => void;
    addExercise?: (exercise: WorkoutExercise) => void;
    replaceExercise?: (exercise: WorkoutExercise) => void;
    refetchHistory?: () => void;
    pbs?: PB[];
    currentExerciseHistory?: ExerciseSet[];
    isFetching: boolean;
    postWorkout?: PostWorkout;
    superset?: Superset;
    setSuperset?: (superset: Superset | undefined) => void;
}

export interface PostWorkout {
    timeStarted: Date;
    timeFinished: Date;
    pbs: PB[];
    workoutName: string;
}

export const WorkoutContext = React.createContext({
    timeStarted: undefined,
    timeUpdated: new Date(),
    followingWorkout: undefined,
    workoutExercises: [],
    focusedExercise: undefined,
    currentWorkout: undefined,
    currentSet: undefined,
    storedExercises: [],
    restStarted: undefined,
    restTime: 0,
    currentWorkoutHistory: undefined,
    currentSetNumber: 1,
    currentWorkoutExercise: undefined,
    currentWorkoutExerciseNumber: 0,
    showWorkoutFinishedPage: false,
    isFetching: false,
    postWorkout: undefined
} as IWorkoutContext);

export const WorkoutContextProvider = (props: { children: ReactElement }) => {
    const {children} = props;
    const [timeUpdated, setTimeUpdated] = useState<Date>(new Date());
    const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[] | undefined>(undefined);
    const [focusedExercise, setFocusedExercise] = useState<Exercise | undefined>(undefined);
    const [currentWorkout, setCurrentWorkout] = useState<Workout | undefined>(undefined);
    const [currentWorkoutExerciseIds, setCurrentWorkoutExerciseIds] = useState<number[]>([]);
    const [currentWorkoutHistory, setCurrentWorkoutHistory] = useState<WorkoutHistory | undefined>(undefined);
    const [currentSet, setCurrentSet] = useState<ExerciseSet | undefined>(undefined);
    const [currentSetNumber, setCurrentSetNumber] = useState(1);
    const [currentWorkoutExercise, setCurrentWorkoutExercise] = useState<WorkoutExercise | undefined>(undefined);
    const [currentWorkoutExerciseNumber, setCurrentWorkoutExerciseNumber] = useState(0);
    const [storedExercises, setStoredExercises] = useState<Record<number, number>>({});
    const [restStarted, setRestStarted] = useState<Date | undefined>(undefined);
    const [restTime, setRestTime] = useState<number>(0);
    const [followingWorkout, setFollowingWorkout] = useState<Workout | undefined>(undefined);
    const [showWorkoutFinishedPage, setShowWorkoutFinishedPage] = useState(false);
    const [refetchHistoryToken, setRefetchHistoryToken] = useState<Date>(new Date());
    const [postWorkout, setPostWorkout] = useState<PostWorkout | undefined>(undefined);
    const [init, setInit] = useState(false);
    const {db} = useContext(DBContext);
    const {time} = useContext(TimerContext);
    const {oneRm, autostop} = useContext(SettingsContext);
    const {t} = useTranslation();
    const [isFetching, setIsFetching] = useState(false);
    const [superset, setSuperset] = useState<Superset | undefined>(undefined);

    const getBlankWorkout = (name?: string) => ({
        id: getId(),
        userName: localStorage.getItem("userName") || "Default User",
        date: new Date(),
        workoutExerciseIds: [],
        workoutName: name || t("freeTraining")
    });

    // Session recovery if we navigate away
    useEffect(() => {
        const storageContext = localStorage.getItem("workoutContext");
        if (storageContext) {
            const context = JSON.parse(storageContext) as IWorkoutContext;
            setTimeUpdated(new Date(context.timeUpdated));
            setWorkoutExercises(context.workoutExercises);
            setFocusedExercise(context.focusedExercise);
            setCurrentWorkout(context.currentWorkout);
            if (context.currentWorkoutHistory) setCurrentWorkoutHistory({
                ...context.currentWorkoutHistory,
                date: new Date(context.currentWorkoutHistory.date)
            });
            setCurrentSet(context.currentSet);
            setCurrentWorkoutExercise(context.currentWorkoutExercise);
            setCurrentWorkoutExerciseNumber(context.currentWorkoutExerciseNumber);
            setCurrentWorkoutExerciseIds(context.currentWorkoutExerciseIds || []);
            setFollowingWorkout(context.followingWorkout);
            setRestStarted(context.restStarted ? new Date(context.restStarted) : undefined);
            setRestTime(context.restTime);
            setStoredExercises(context.storedExercises);
            setPbs(context.pbs || []);
            setTimeout(() => {
                setCurrentSetNumber(context.currentSetNumber);
                defer(() => { setInit(true); setRefetchHistoryToken(new Date()) }); // defer set init until all collateral effects have been triggered
            }, 300);
            setPostWorkout(context.postWorkout);
            setSuperset(context.superset);
        } else { setInit(true); }
    }, []);

    const startWorkout = useCallback(async (followingWorkout?: Workout) => {
        setTimeUpdated(new Date());
        setWorkoutExercises([]);
        setFocusedExercise(undefined);
        setCurrentSetNumber(1);
        setCurrentWorkoutExerciseNumber(0);
        setCurrentWorkoutHistory(getBlankWorkout(followingWorkout?.name));
        setFollowingWorkout(followingWorkout);
        setFocusedExercise(undefined);
        setCurrentSet(undefined);
        setRestStarted(undefined);
        setStoredExercises([]);
        setPbs([]);
        setSuperset(undefined);
    }, [t, setCurrentWorkoutHistory, setWorkoutExercises, setCurrentSetNumber, setCurrentWorkoutExerciseNumber, setFollowingWorkout, setFocusedExercise, setStoredExercises]);

    useEffect(() => {
        if (!setCurrentWorkout || !init) return;
        if (!followingWorkout) {
            setCurrentWorkout(undefined);
            return;
        }
        db?.workout.get(followingWorkout.id).then((workout) => {
            if (workout) {
                setCurrentWorkout(workout);
                setCurrentWorkoutExerciseIds(workout.workoutExerciseIds);
            }
        });
    }, [followingWorkout, setCurrentWorkout, db]);

    useEffect(() => {
        if (!setCurrentWorkoutExercise || !init) return;
        if (!currentWorkout) {
            setCurrentWorkoutExercise(undefined);
            return;
        }
        if (currentWorkoutExerciseNumber >= currentWorkoutExerciseIds.length) return setShowWorkoutFinishedPage(true);
        setShowWorkoutFinishedPage(false);
        db?.workoutExercise.get(currentWorkoutExerciseIds[currentWorkoutExerciseNumber]).then((workoutExercise) => {
            if (workoutExercise) {
                if (!superset) {
                    setCurrentSetNumber(1);
                    if (workoutExercise.superset) {
                        setSuperset({current: 1, size: 2});
                    }
                }
                setCurrentWorkoutExercise({...workoutExercise, initial: false});
            }
        });
    }, [currentWorkout, currentWorkoutExerciseNumber, setCurrentWorkoutExercise, db]);

    const fetchSet = useCallback(async () => {
        if (!currentWorkoutExercise || !init) {
            return;
        }
        if (!db || currentWorkoutExercise.setIds[currentSetNumber - 1] === currentSet?.id || !currentWorkoutExercise.setIds[currentSetNumber - 1]) return;
        let set = undefined;
        if (storedExercises[currentWorkoutExercise.exerciseId]) {
            const workoutExercise = await db.workoutExercise.get(storedExercises[currentWorkoutExercise.exerciseId]);
            if (workoutExercise) {
                set = await db.exerciseSet.get(workoutExercise.setIds[currentSetNumber - 1]);
            }
        }
        if (!set) {
            set = await db.exerciseSet.get(currentWorkoutExercise.setIds[currentSetNumber - 1]);
        }
        return set;
    }, [currentSet, currentWorkoutExercise, currentSetNumber, db, storedExercises]);

    useEffect(() => {
        if (!init) return;
        if (!currentWorkoutExercise) {
            setCurrentSet(undefined);
            return;
        }
        fetchSet().then((maybeSet) => {
            if (maybeSet) setCurrentSet(maybeSet);
        })
    }, [fetchSet, currentWorkoutExercise, setCurrentSet]);

    useEffect(() => {
        if (!init || !currentWorkoutExercise || focusedExercise?.id === currentWorkoutExercise.exerciseId) {
            return;
        }
        db?.exercise.get(currentWorkoutExercise.exerciseId).then((exercise) => {
            if (exercise && setFocusedExercise) {
                setFocusedExercise(exercise);
            }
        });
    }, [focusedExercise, currentWorkoutExercise, setFocusedExercise, db]);

    const startRest = useCallback((time: number) => {
        setRestStarted(new Date());
        setRestTime(time);
        setTimeUpdated(new Date());
    }, [setRestStarted]);

    const [pbs, setPbs] = useState<PB[]>([]);

    const [currentExerciseHistory, setCurrentExerciseHistory] = useState<ExerciseSet[]>([]);

    const checkPb = useCallback((set: ExerciseSet) => {
        if (!init || !focusedExercise) return;
        const exercise = focusedExercise.name;
        const history = [...currentExerciseHistory];
        if (focusedExercise && set.weight && history.filter((it) => !it.initial && it.weight && it.weight >= set.weight!).length === 0) {
            // Weight PR
            setPbs((pbs) => ([...pbs, {exercise, recordType: "weight", value: set.weight!}]));
        }
        if (focusedExercise && set.weight && set.reps && history.filter((it) => !it.initial && it.weight && it.reps && it.weight * it.reps >= set.weight! * set.reps!).length === 0) {
            // Volume PR
            setPbs((pbs) => ([...pbs, {
                exercise,
                recordType: "volume",
                value: set.weight! * set.reps!
            }]));
        }
        if (focusedExercise && set.weight && set.reps && history.filter((it) => !it.initial && it.weight && it.reps && getOneRm(it.weight, it.reps, oneRm) >= getOneRm(set.weight!, set.reps!, oneRm)).length === 0) {
            // 1RM PR
            setPbs((pbs) => ([...pbs, {
                exercise,
                recordType: "oneRm",
                value: getOneRm(set.weight!, set.reps!, oneRm)
            }]));
        }
        if (focusedExercise && set.laps && history.filter((it) => !it.initial && it.laps && it.laps >= set.laps!).length === 0) {
            // Laps PR
            setPbs((pbs) => ([...pbs, {exercise, recordType: "laps", value: set.laps!}]));
        }
    }, [focusedExercise, currentExerciseHistory]);

    const saveSet = useCallback(async (set: ExerciseSet) => {
        if (!init || !currentWorkoutExercise || !db || !currentWorkout || !currentWorkoutExercise.setIds) return;
        setIsFetching(true);
        setTimeUpdated(new Date());
        checkPb(set);
        db.transaction("rw", [db.exerciseSet, db.workoutExercise], async (tx) => {
            await db?.exerciseSet.put({...set, initial: false});
            currentWorkoutExercise.setIds[currentSetNumber - 1] = set.id;
            const oldId = currentWorkoutExercise.id;
            const newId = getId();
            await db?.workoutExercise.put({...currentWorkoutExercise, id: newId});
            setCurrentWorkoutExercise({...currentWorkoutExercise, id: newId});
            setCurrentWorkoutExerciseIds((prevIds) => {
                const ret = [...prevIds];
                ret.splice(prevIds.indexOf(oldId), 1, newId);
                return ret;
            });
            if (superset) {
              if (currentSetNumber >= currentWorkoutExercise.setIds.length && superset.current === superset.size) {
                  // superset done
                  setSuperset(undefined);
                  setCurrentWorkoutExerciseNumber((prevNumber) => prevNumber + 1);
                  setCurrentSetNumber(1);
              } else if (superset.current === superset.size) {
                  setCurrentSetNumber((prevNumber) => prevNumber + 1);
                  setCurrentWorkoutExerciseNumber((prevNumber) => prevNumber - superset.size + 1);
                  setSuperset((superset) => ({ size: superset?.size || 1, current: 1}));
              } else {
                  setCurrentWorkoutExerciseNumber((prevNumber) => prevNumber + 1);
                  setSuperset((superset) => ({ size: superset?.size || 1, current: (superset?.current || 1) + 1 }));
              }
            } else if (currentSetNumber >= currentWorkoutExercise.setIds.length) {
                setCurrentWorkoutExerciseNumber((prevNumber) => prevNumber + 1);
                setCurrentSetNumber(1);
            } else {
                setCurrentSetNumber((prevNumber) => prevNumber + 1);
            }
            setIsFetching(false);
            if (set.rest) {
                startRest(set.rest);
            }
        })
    }, [superset, db, checkPb, currentWorkoutExercise, currentSetNumber, currentWorkoutHistory, storedExercises, setCurrentWorkoutHistory, setCurrentWorkoutExerciseNumber, setCurrentSetNumber, setStoredExercises, startRest]);

    useEffect(() => {
        setCurrentWorkoutHistory((prevState) => prevState ? ({...prevState, workoutExerciseIds: currentWorkoutExerciseIds}) : prevState);
    }, [currentWorkoutExerciseIds]);

    const stopRest = useCallback(() => {
        setRestStarted(undefined);
        setRestTime(0);
        setTimeUpdated(new Date());
    }, [setRestStarted]);

    const notEmptyHistory = async (exerciseIds: number[]) => {
        const exercises = await db?.workoutExercise.bulkGet(currentWorkoutExerciseIds);
        const setIds = exercises?.flatMap((it) => it ? it.setIds : []);
        const sets = setIds ? await db?.exerciseSet.bulkGet(setIds) : [];
        return sets && sets.filter((it) => it && !it.initial).length > 0;
    }

    const stopWorkout = useCallback(async () => {
        if (currentWorkoutHistory) setPostWorkout({
            timeStarted: currentWorkoutHistory.date,
            timeFinished: new Date(),
            workoutName: currentWorkoutHistory.workoutName,
            pbs
        });
        if (currentWorkoutHistory && await notEmptyHistory(currentWorkoutExerciseIds)) await db?.workoutHistory.put({
            ...currentWorkoutHistory,
            workoutExerciseIds: currentWorkoutExerciseIds
        });
        setWorkoutExercises(undefined);
        setFocusedExercise(undefined);
        setCurrentSetNumber(1);
        setCurrentWorkoutExerciseNumber(0);
        setCurrentWorkoutHistory(undefined)
        setFollowingWorkout(undefined);
        setFocusedExercise(undefined);
        setCurrentSet(undefined);
        setRestStarted(undefined);
        setRestTime(0);
        setStoredExercises([]);
        setPbs([]);
        setSuperset(undefined);
        setCurrentWorkout(undefined);
    }, [db, currentWorkoutHistory, currentWorkoutExerciseIds, setWorkoutExercises, setCurrentSetNumber,
        setCurrentWorkoutExerciseNumber, setCurrentWorkoutHistory, setFollowingWorkout, setFocusedExercise, setStoredExercises,
        setCurrentSet, setRestStarted, setRestTime]);

    const addSet = useCallback(async () => {
        if (!init || !db || !currentSet || !currentWorkoutExercise) return;
        const newSet = {...currentSet, id: getId()};
        await db.exerciseSet.put(newSet);
        const oldId = currentWorkoutExercise.id;
        const newId = getId();
        const setIds = currentWorkoutExercise.setIds.concat(newSet.id);
        await db.workoutExercise.put({...currentWorkoutExercise, id: newId, setIds});
        setCurrentWorkoutExercise({...currentWorkoutExercise, id: newId, setIds});
        setCurrentWorkoutExerciseIds((prevIds) => {
            const ret = [...prevIds];
            ret.splice(prevIds.indexOf(oldId), 1, newId);
            return ret;
        });
        setCurrentSetNumber(currentWorkoutExercise.setIds.length + 1);
        setTimeUpdated(new Date());
        setSuperset(undefined);
    }, [db, currentWorkoutExercise, currentSet, currentSetNumber]);

    const removeSet = useCallback(async () => {
        if (!init || !db || !currentSet || !currentWorkoutExercise) return;
        if (currentWorkoutExercise.setIds.length === 1) return;
        const oldId = currentWorkoutExercise.id;
        const newId = getId();
        const setIds = currentWorkoutExercise.setIds.filter((_, idx) => idx === currentSetNumber - 1);
        await db.workoutExercise.put({...currentWorkoutExercise, id: newId, setIds});
        setCurrentWorkoutExercise({...currentWorkoutExercise, id: newId, setIds});
        setCurrentWorkoutExerciseIds((prevIds) => {
            const ret = [...prevIds];
            ret.splice(prevIds.indexOf(oldId), 1, newId);
            return ret;
        });
        setCurrentSetNumber((curNumber) => curNumber === 1 ? 1 : curNumber - 1);
        setTimeUpdated(new Date());
        setSuperset(undefined);
    }, [db, currentWorkoutExercise, currentSet, currentSetNumber]);

    useEffect(() => {
        if (!init) return;
        const getData = async () => {
            if (currentWorkoutHistory && db && currentWorkoutExercise && focusedExercise && currentWorkoutHistory?.date) {
                const sets: ExerciseSet[] = [];
                const allSets = (await db.exerciseSet
                    .where("exerciseId")
                    .equals(focusedExercise.id)
                    .toArray())
                    .filter((it) => !it.initial)
                    .sort(compareSetHistoryEntries);
                sets.push(...allSets);
                return sets;
            }
        }
        getData().then((result) => {
            setCurrentExerciseHistory(result || []);
        });
    }, [db, currentWorkoutHistory, focusedExercise, currentSetNumber, currentWorkoutExercise, refetchHistoryToken]);

    const addExercise = useCallback((workoutExercise: WorkoutExercise) => {
        const weids = [...(currentWorkout && currentWorkoutExerciseIds ? currentWorkoutExerciseIds : []), workoutExercise.id];
        if (!currentWorkout) {
            setWorkoutExercises([]);
            setFocusedExercise(undefined);
            setCurrentSetNumber(1);
            setCurrentWorkoutExerciseNumber(0);
            setCurrentWorkoutHistory(getBlankWorkout());
            setFollowingWorkout(undefined);
            setFocusedExercise(undefined);
            setCurrentSet(undefined);
            setRestStarted(undefined);
            setStoredExercises([]);
            setPbs([]);
            setCurrentWorkout({
                id: getId(),
                name: t("freeTraining"),
                workoutExerciseIds: weids,
                daysOfWeek: []
            });
            setSuperset(undefined);
        }
        else setCurrentWorkout((prevState) => ({...prevState!, workoutExerciseIds: weids, name: t("freeTraining")}));
        setCurrentWorkoutHistory((prevState) => ({...prevState ? prevState : getBlankWorkout(), workoutName: t("freeTraining")}));
        setCurrentWorkoutExerciseIds(weids);
        setCurrentWorkoutExerciseNumber((currentWorkoutExerciseIds.length));
        setCurrentWorkoutExercise(workoutExercise);
        setCurrentSetNumber(1);
        setTimeUpdated(new Date());
    }, [currentWorkout, currentWorkoutExerciseIds, setCurrentWorkoutHistory, setCurrentWorkoutExerciseNumber, setCurrentWorkoutExerciseIds, setCurrentWorkoutExercise, setCurrentSetNumber]);

    const replaceExercise = useCallback((workoutExercise: WorkoutExercise) => {
        setCurrentWorkoutExerciseIds((prevIds) => {
            const ret = [...prevIds];
            ret.splice(prevIds.indexOf(currentWorkoutExercise!.id), 1, workoutExercise.id);
            return ret;
        });
        setCurrentWorkoutExercise(workoutExercise);
        setCurrentSetNumber(1);
        setTimeUpdated(new Date());
        setSuperset(undefined);
    }, [currentWorkout, currentWorkoutExercise, currentWorkoutExerciseIds, setCurrentWorkoutHistory, setCurrentWorkoutExerciseNumber, setCurrentWorkoutExerciseIds, setCurrentWorkoutExercise, setCurrentSetNumber]);;

    useEffect(() => {
        if (!currentWorkout) return;
        if (autostop && new Date().getTime() - timeUpdated.getTime() > 3600000) {
            stopWorkout();
        }
    }, [autostop, currentWorkout, timeUpdated, time]);

    const refetchHistory = () => {
        setRefetchHistoryToken(new Date());
    }

    const context = {
        timeStarted: currentWorkoutHistory?.date,
        timeUpdated,
        followingWorkout,
        workoutExercises,
        focusedExercise,
        currentWorkout,
        currentSet,
        currentSetNumber,
        restTime,
        restStarted,
        currentWorkoutExercise,
        currentWorkoutExerciseNumber,
        currentWorkoutHistory,
        setCurrentWorkout,
        setCurrentSet,
        setCurrentSetNumber,
        setCurrentWorkoutExercise, currentWorkoutExerciseIds,
        setFocusedExercise,
        setCurrentWorkoutExerciseNumber, setShowWorkoutFinishedPage,
        setRestStarted, isFetching,
        setCurrentWorkoutHistory, replaceExercise, refetchHistory, postWorkout,
        storedExercises, addSet, removeSet, addExercise, pbs, currentExerciseHistory, superset, setSuperset,
        startWorkout, saveSet, stopWorkout, startRest, stopRest, setRestTime, showWorkoutFinishedPage
    };

    useEffect(() => {
        if (!init) {
            return;
        }
        localStorage.setItem("workoutContext", JSON.stringify(context));
    }, [init, context]);

    return <WorkoutContext.Provider value={context}>
        {children}
    </WorkoutContext.Provider>
}
