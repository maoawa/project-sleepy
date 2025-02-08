let currentMedia = {
    title: null,
    artist: null,
    album: null,
    app: null
};

export async function marsHomePod(data) {
    const homePodData = data['media_player.mars_homepod_right'];
    const homePodStateElement = document.getElementById('homepod-state');
    const homePodCoverContainer = homePodStateElement.parentNode; // 获取父容器

    if (homePodData) {
        const mediaTitle = homePodData.media_title;
        const mediaArtist = homePodData.media_artist || '未知艺术家';
        const mediaAlbumName = homePodData.media_album_name || null; // 如果专辑名无效，设为 null
        let appName = homePodData.app_name || '未知应用';

        // 如果 appName 是 "Music"，替换为 "Apple Music"
        if (appName === 'Music') {
            appName = '<i class="fa-brands fa-apple fa-xs"></i>Music';
        }

        // 检查是否需要更新
        if (
            currentMedia.title === mediaTitle &&
            currentMedia.artist === mediaArtist &&
            currentMedia.album === mediaAlbumName &&
            currentMedia.app === appName
        ) {
            return;
        }

        // 更新缓存数据
        currentMedia = {
            title: mediaTitle,
            artist: mediaArtist,
            album: mediaAlbumName,
            app: appName
        };

        if (mediaTitle) {
            let mediaInfo = `${mediaTitle}<br>${mediaArtist}`;
            if (mediaAlbumName) {
                mediaInfo += ` - ${mediaAlbumName}`; // 仅当专辑名有效时添加
            }
            mediaInfo += `<br>${appName}`;

            homePodStateElement.innerHTML = mediaInfo;

            // 如果封面不存在，创建并插入它
            let homePodCoverElement = document.getElementById('homepod-cover');
            if (!homePodCoverElement) {
                homePodCoverElement = document.createElement('img');
                homePodCoverElement.id = 'homepod-cover';
                homePodCoverElement.className = 'homepod-cover';
                homePodCoverContainer.insertBefore(homePodCoverElement, homePodStateElement);
            }

            // 更新专辑封面
            const coverPath = `states/covers/${mediaTitle}.png`;
            homePodCoverElement.src = coverPath;
            homePodCoverElement.onerror = () => {
                // 如果封面图片不存在，移除封面和 <br>
                homePodCoverElement.remove();
                const brElement = document.getElementById('homepod-br');
                if (brElement) {
                    brElement.remove();
                }
            };

            // 添加 <br> 标签
            let brElement = document.getElementById('homepod-br');
            if (!brElement) {
                brElement = document.createElement('br');
                brElement.id = 'homepod-br';
                homePodCoverContainer.insertBefore(brElement, homePodStateElement);
            }

            // 获取专辑封面的主色调并更新文字颜色
            try {
                const dominantColor = await getDominantColor(coverPath);
                homePodStateElement.style.color = dominantColor || 'black';
            } catch (error) {
                console.error('Failed to extract color:', error);
            }
        } else {
            homePodStateElement.textContent = '未在播放';
            homePodStateElement.style.color = 'gray';

            // 移除封面图片和 <br>
            const homePodCoverElement = document.getElementById('homepod-cover');
            if (homePodCoverElement) {
                homePodCoverElement.remove();
            }

            const brElement = document.getElementById('homepod-br');
            if (brElement) {
                brElement.remove();
            }
        }
    } else {
        homePodStateElement.textContent = '未在播放';
        homePodStateElement.style.color = 'gray';

        // 移除封面图片和 <br>
        const homePodCoverElement = document.getElementById('homepod-cover');
        if (homePodCoverElement) {
            homePodCoverElement.remove();
        }

        const brElement = document.getElementById('homepod-br');
        if (brElement) {
            brElement.remove();
        }
    }
}

// 提取图片主色调的辅助函数
async function getDominantColor(imageSrc) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageSrc;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageData = ctx.getImageData(0, 0, img.width, img.height).data;

            // 计算主色调，避开与深灰色接近的颜色
            const darkGray = [30, 30, 30]; // 深灰色 (30, 30, 30)
            const threshold = 50; // 差异阈值
            let r = 0,
                g = 0,
                b = 0,
                count = 0;

            for (let i = 0; i < imageData.length; i += 4) {
                const pixelR = imageData[i];
                const pixelG = imageData[i + 1];
                const pixelB = imageData[i + 2];

                // 计算颜色差异
                const diff =
                    Math.sqrt(
                        Math.pow(pixelR - darkGray[0], 2) +
                        Math.pow(pixelG - darkGray[1], 2) +
                        Math.pow(pixelB - darkGray[2], 2)
                    );

                // 跳过与深灰色接近的颜色
                if (diff > threshold) {
                    r += pixelR;
                    g += pixelG;
                    b += pixelB;
                    count++;
                }
            }

            if (count === 0) {
                // 如果有效像素为零，设置为默认颜色
                resolve('white');
            } else {
                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);
                resolve(`rgb(${r}, ${g}, ${b})`);
            }
        };

        img.onerror = (err) => {
            reject(err);
        };
    });
}