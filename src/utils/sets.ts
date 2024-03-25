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
const intersect = (set1: unknown[], set2: unknown[]) => {
    return set1.filter((it) => set2.includes(it));
}

export const includesAll = (set: unknown[], values: unknown[]) => {
    return values.filter((it) => set.includes(it)).length === values.length;
}

export default intersect;
