import fs from 'node:fs';
import path from 'node:path';

export class Tree {
    static #tree = '';
    public static print(dirPath: string) {
        this.#tree = '';
        this.printTree(dirPath);
        return this.#tree;
    }
    private static printTree(dirPath: string, prefix = '') {
        let files = fs.readdirSync(dirPath);

        files = files.sort((f1, b1) => {
            const f1Stat = fs.lstatSync(path.join(dirPath, f1));
            const b1Stat = fs.lstatSync(path.join(dirPath, b1));
            if (f1Stat.isDirectory() && !b1Stat.isDirectory()) return -1;
            if (!f1Stat.isDirectory() && b1Stat.isDirectory()) return 1;
            return f1.localeCompare(b1);
        });

        files.forEach((file, index) => {
            const filePath = path.join(dirPath, file);

            if (this.isIgnored(filePath) || this.isHidden(file)) {
                return;
            }

            const stats = fs.statSync(filePath);
            const isLast = index === files.length - 1;
            if (stats.isDirectory()) {
                this.#tree += `\n${prefix}${isLast ? '└─' : '├─'} 📁 ${file}/`;
                this.printTree(filePath, `${prefix}│  `);
            } else {
                this.#tree += `\n${prefix}${
                    isLast ? '└─' : '├─'
                } ${this.fileEmoji(file)} ${file}`;
            }
        });
        return this.#tree;
    }

    public static isIgnored(filePath: string): boolean {
        const gitIgnorePath = path.join(process.cwd(), '.gitignore');

        if (!fs.existsSync(gitIgnorePath)) {
            return false;
        }

        const gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8');
        const ignoredPatterns = gitIgnoreContent.split('\n').filter(Boolean);

        return ignoredPatterns.some((pattern) =>
            filePath.match(new RegExp(pattern))
        );
    }

    public static isHidden(file: string): boolean {
        return file.startsWith('.');
    }

    private static fileEmoji(file: string) {
        const fileExt = file.split('.').pop();
        if (file.includes('lock')) return '🔒';
        if (file.includes('config')) return '🔧';
        switch (fileExt) {
            case 'ts':
                return '🟦';
            case 'js':
                return '🟨';
            case 'json':
                return '🟩';
            case 'yml':
                return '🟪';
            case 'yaml':
                return '🟪';
            case 'md':
                return '📝';
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'svg':
            case 'ico':
            case 'webp':
                return '🖼️';
            case 'mp4':
            case 'mov':
            case 'mkv':
            case 'webm':
                return '🎞️';
            case 'mp3':
            case 'wav':
                return '🎵';
            case 'exe':
            case 'bat':
            case 'sh':
            case 'ps1':
            case 'deb':
            case 'rpm':
            case 'apk':
                return '🖥️';
            case 'zip':
            case 'rar':
                return '📦';
            case 'css':
                return '🎨';
            case 'py':
                return '🐍';
            case 'java':
                return '☕';
            case 'c':
            case 'cpp':
                return '👾';
            case 'php':
                return '🐘';
            case 'go':
                return '🐹';
            case 'rb':
                return '💎';
            case 'sql':
                return '🗃️';
            case 'rs':
                return '🦀';
            default:
                return '📄';
        }
    }
}
