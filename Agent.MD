# SparrowFi Agent Guide

## Overview
SparrowFi is a client-side Angular application designed to manage banking and financial data securely by avoiding server-side storage and browser caching for sensitive state. All data is persisted manually via a proprietary `.spw` binary file.

## Core Responsibilities
- **Maintain No-Cache Policy**: Ensure that `localStorage`, `sessionStorage`, or `IndexedDB` are never used to store user financial data.
- **State Management**: All state is held entirely in memory using an Angular service (`StateService`).
- **Data Export Prompt**: Ensure users are always warned about unsaved changes via the `beforeunload` event if they try to close or refresh the page before exporting their `.spw` file.
- **File Handling**: Parsing and generation of the `.spw` binary file are done strictly in-browser via the `FileReader` and `Blob` APIs.
