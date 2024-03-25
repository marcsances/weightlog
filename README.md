# WeightLog Gym tracker

![Node JS CI](https://github.com/marcsances/weightlog/actions/workflows/node.js.yml/badge.svg)

This is a free workout and fitness tracker developed as a PWA.

It is being developed by [Marc Sances](mailto:marc.sances@coetic.cat).

## Technologies

* Frontend: [React](https://react.dev)
* UI kit: [MUI](https://mui.com)
* Compiler: [Vite](https://vitejs.dev)
* Language: [Typescript](https://www.typescriptlang.org/)
* Local Database: [Dexie (IndexedDB)](https://dexie.org)
* CI/CD: [Github Actions](https://github.com/features/actions)
* Package manager: [npm](https://www.npmjs.com/)
* Error tracing: [Sentry](https://sentry.io)

## Requirements

* Node 17+ (Tested on Node 21)

## Changelog

Refer to the file [whatsNew.tsx](./src/pages/whatsNew/whatsNew.tsx) for a changelog.

## Usage

**You can access a live version of this app through [this link](https://weightlog.marcsances.net)**. The next steps are
necessary only if you want to run or modify this app locally.

To install, run:

```
npm install
```

**Please disable telemetry or update the Sentry DSN if you clone locally!**

I still don't have the environment variables set up so you will have to modify it directly in [App.tsx](./src/App.tsx).

Replace ``https://a0ae6d17918730260356b59cf049b2a3@o4506716569927680.ingest.sentry.io/4506716576153601`` with your own Sentry   DSN, or comment out the entire ``Sentry.init`` function call.

To run the dev server, use:

```
npm start
```

To build for production, run:

```
npm run build
```

## FAQ

##### Why there are no workouts or exercises by default?

This app is intended to be a workout log for already instructed users.

It is being developed by a single developer with no fitness instruction, and providing any kind of opinionated
information would be detrimental in the job of fitness professionals. Please refer to a qualified fitness professional
if you require assistance using this app.

##### Do I need to clone this project and host it to use this app?

No, you can use my hosted version at [https://weightlog.marcsances.net](https://weightlog.marcsances.net).

##### Can I host this project or modified versions of it?

Yes, you can under the terms of the GNU General Public License version 3 or, at your election, any later version.

This means, along further restrictions, that you are required to provide your users with access to the source code,
should they request you to do so.

##### Can I charge for modified versions of this app?

Yes, but you are required to provide the source code for them upon request from your users, which may also freely
distribute your app if they wish to do so.

##### Will this app always be free?

The core app (WeightLog) will always be free for everyone. Plans for additional services on top of it are undergoing, we
will be excited to announce them when they are available.

##### Are pull requests accepted?

Yes, refer to the file [CONTRIBUTING.md](./CONTRIBUTING.md) before sending a pull request.

##### Where can I contact you?

Either use the [contact form at this link](https://docs.google.com/forms/d/e/1FAIpQLSdrG44hZZ8MoGzFx2DjIVKSnFylDDbCHtaQL3vhEGM4yuOb8g/viewform?usp=sf_link) or you may email me directly at [marc.sances@coetic.cat](mailto:marc.sances@coetic.cat)

## License

Copyright Marc Sances 2024. All rights reserved.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see [https://www.gnu.org/licenses/](https://www.gnu.org/licenses/)

