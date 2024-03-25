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
import Dexie, {Table} from 'dexie';
import {Exercise} from "../models/exercise";
import {ExerciseSet, Plan, Workout, WorkoutExercise, WorkoutHistory} from "../models/workout";
import {User, UserMetric} from "../models/user";

export class DexieDB extends Dexie {
    exercise!: Table<Exercise>;
    workout!: Table<Workout>;
    workoutHistory!: Table<WorkoutHistory>;
    workoutExercise!: Table<WorkoutExercise>;
    exerciseSet!: Table<ExerciseSet>;
    user!: Table<User>;
    userMetric!: Table<UserMetric>;
    plan!: Table<Plan>;
    constructor() {
        const maybeUser = localStorage.getItem("userName");
        super(maybeUser && maybeUser !== "Default User" ? `weightlog-${maybeUser}` : 'weightlog');
        this.version(2).stores({
            exercise: "++id, name, type, *tags",
            workout: "++id, name",
            workoutHistory: "++id, userName, date, workoutExerciseIds",
            workoutExercise: "++id, exerciseId, setIds",
            exerciseSet: "++id, exerciseId, type",
            user: "++name",
            userMetric: "++id",
            plan: "++id, workoutId, name"
        });
        this.version(3).stores({
            exercise: "++id, name, type, *tags",
            workout: "++id, name",
            workoutHistory: "++id, userName, date, workoutExerciseIds",
            workoutExercise: "++id, exerciseId, setIds",
            exerciseSet: "++id, exerciseId, type",
            user: "++name",
            userMetric: "++id, metric",
            plan: "++id, workoutId, name"
        })
    }
}

export const db = new DexieDB();
