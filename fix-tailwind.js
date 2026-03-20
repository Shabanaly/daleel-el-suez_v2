/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const dir = './src/components';
const appDir = './src/app';

const replaceRules = [
    { from: /bg-gradient-to/g, to: 'bg-linear-to' },
    { from: /from-\[\#087cf7\]/g, to: 'from-primary-500' },
    { from: /to-\[\#0ea5e9\]/g, to: 'to-accent' },
    { from: /text-\[\#0ea5e9\]/g, to: 'text-accent' },
    { from: /border-\[\#0ea5e9\]/g, to: 'border-accent' },
    { from: /bg-\[\#0ea5e9\]/g, to: 'bg-accent' },
    { from: /bg-\[\#087cf7\]/g, to: 'bg-primary-500' },
    { from: /from-\[\#0d1b2e\]/g, to: 'from-surface' },
    { from: /bg-\[\#0d1b2e\]/g, to: 'bg-surface' },
    { from: /bg-\[\#050c1a\]/g, to: 'bg-background' },
    { from: /border-\[\#050c1a\]/g, to: 'border-base' },
    { from: /bg-\[\#1e2a3a\]/g, to: 'bg-elevated' },
    { from: /to-\[\#9ccafc\]/g, to: 'to-primary-200' },
    { from: /border-\[rgba\(14,165,233,0\.12\)\]/g, to: 'border-border-subtle' },
    { from: /\[mask-image:radial-gradient\((.*?)\)\]/g, to: 'mask-[radial-gradient($1)]' },
    { from: /p-\[1px\]/g, to: 'p-px' },
];

function walkSync(currentDirPath, callback) {
    if (!fs.existsSync(currentDirPath)) return;
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && filePath.endsWith('.tsx')) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

const applyRules = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    replaceRules.forEach(rule => {
        content = content.replace(rule.from, rule.to);
    });
    if (original !== content) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
};

walkSync(dir, applyRules);
walkSync(appDir, applyRules);
replaceRules.push({ from: /aspect-\[16\/9\]/g, to: 'aspect-video' });
replaceRules.push({ from: /aspect-\[21\/9\]/g, to: 'aspect-21/9' });
replaceRules.push({ from: /aspect-\[4\/3\]/g, to: 'aspect-4/3' });

walkSync(dir, applyRules);
walkSync(appDir, applyRules);
