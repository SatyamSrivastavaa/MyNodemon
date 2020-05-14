#!/usr/bin/env node

const chokidar = require('chokidar');
const debounce = require('lodash.debounce');
const program = require('caporal');
const chalk = require('chalk');
const fs = require('fs');
const { spawn } = require('child_process');

program
    .version('1.0.0')
    .argument('[filename]', 'Name of a file to execute')
    .action(async ({ filename }) => {
        const name = filename || 'index.js';
        let prevProcess;

        try{
            await fs.promises.access(name);
        } catch(err) {
            throw new Error(`Cannot find a file with a name ${name}`);
        }

        const checkForUpdates = debounce(() => {
                if(prevProcess){
                    prevProcess.kill();
                }
                console.log(chalk.green('>>>> Process started...'))
                prevProcess = spawn('node', [name], { stdio: 'inherit' });
            }, 
            100
        );
        
        chokidar
            .watch('.')
            .on('add', checkForUpdates)
            .on('change', checkForUpdates)
            .on('unlink', checkForUpdates);
    });

program.parse(process.argv);
