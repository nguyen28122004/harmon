import { attachContextMenu } from './contextMenu.js';
import { saveItemStates } from './stateManager.js';
import { isRestoring } from './stateManager.js';
import { renderSidebarTabs } from './sidebar.js';
import { items } from './items.js';

export const activeItems = new Set();
export let snapEnabled = true;

export function setSnapEnabled(value) {
    snapEnabled = value;
}

const sidebar = document.getElementById('sidebar');
const gameCanvas = document.getElementById('gameCanvas');

export function snapToGrid(x, y, gridSize = 5) {
    return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize
    };
}

export function getGameCanvasScale() {
    const rect = gameCanvas.getBoundingClientRect();
    return {
        scaleX: rect.width / gameCanvas.offsetWidth,
        scaleY: rect.height / gameCanvas.offsetHeight
    };
}

export function createCanvasItem(key,
    meta,
    isClone = false,
    initialOffset = { x: 0, y: 0 },
    initialPosition = { x: 0, y: 0 },
    options = {}) {

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = meta.src;

    let frameWidth, frameHeight;
    let currentFrame = 0;


    canvas.classList.add(isClone ? 'game-item' : 'sidebar-item');

    img.onload = () => {
        const totalRows = meta.rownum || 1;
        const row = meta.row || 0;
        canvas.dataset.rownum = meta.rownum;
        canvas.dataset.row = meta.row;


        frameWidth = img.width / meta.frames;
        frameHeight = img.height / totalRows;
        // console.log(meta.row, ": ", frameWidth, "x", frameHeight);

        const scale = parseFloat(canvas.dataset.scale || meta.scale || 1);
        canvas.dataset.scale = scale;
        canvas.dataset.rotation = canvas.dataset.rotation || '0';

        canvas.width = frameWidth * scale;
        canvas.height = frameHeight * scale;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 6;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(0, 0, canvas.width, canvas.height, 12);
        ctx.clip();

        ctx.translate(canvas.width / 2, canvas.height / 2);
        // ctx.rotate((parseFloat(canvas.dataset.rotation) || 0) * Math.PI / 180);
        ctx.drawImage(
            img,
            currentFrame * frameWidth,
            row * frameHeight,
            frameWidth,
            frameHeight, -canvas.width / 2, -canvas.height / 2,
            canvas.width,
            canvas.height
        );
        ctx.restore();


        if (meta.frames > 1 && isClone) {
            let lastTime = performance.now();
            const frameDuration = 200;

            function animate(time) {
                const elapsed = time - lastTime;
                if (elapsed > frameDuration) {
                    currentFrame = (currentFrame + 1) % meta.frames;
                    lastTime = time;
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Thiết lập đổ bóng mềm, đẹp
                ctx.shadowColor = 'rgba(0,0,0,0.2)';
                ctx.shadowBlur = 12;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 6;

                // Bo góc: dùng roundRect và clip để giới hạn vùng vẽ
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(0, 0, canvas.width, canvas.height, 12);
                ctx.clip();

                ctx.translate(canvas.width / 2, canvas.height / 2);
                // ctx.rotate((parseFloat(canvas.dataset.rotation) || 0) * Math.PI / 180);
                ctx.scale(scale, scale); // 👈 thêm dòng này
                ctx.drawImage(
                    img,
                    currentFrame * frameWidth,
                    row * frameHeight,
                    frameWidth,
                    frameHeight, -frameWidth / 2, -frameHeight / 2,
                    frameWidth,
                    frameHeight
                );
                ctx.restore();

                requestAnimationFrame(animate);
            }
            requestAnimationFrame(animate);
        }
    };

    let offsetX, offsetY;
    let dragging = false;
    let lastTouchX = 0,
        lastTouchY = 0;

    const startDrag = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        const { scaleX, scaleY } = getGameCanvasScale();
        offsetX = (clientX - rect.left) / scaleX;
        offsetY = (clientY - rect.top) / scaleY;
    };


    const updatePosition = (clientX, clientY) => {
        const gameRect = gameCanvas.getBoundingClientRect();
        const { scaleX, scaleY } = getGameCanvasScale();
        let newX = (clientX - gameRect.left) / scaleX - offsetX;
        let newY = (clientY - gameRect.top) / scaleY - offsetY;
        canvas.style.left = newX + 'px';
        canvas.style.top = newY + 'px';
    };


    const endDrag = (clientX, clientY) => {
        const sidebarRect = sidebar.getBoundingClientRect();
        const gameRect = gameCanvas.getBoundingClientRect();
        const { scaleX, scaleY } = getGameCanvasScale();
        const dropX = (clientX - gameRect.left) / scaleX - offsetX;
        const dropY = (clientY - gameRect.top) / scaleY - offsetY;

        if (clientX >= sidebarRect.left && clientX <= sidebarRect.right &&
            clientY >= sidebarRect.top && clientY <= sidebarRect.bottom) {
            if (canvas.parentNode === gameCanvas) gameCanvas.removeChild(canvas);
            if (!document.getElementById('sidebar-' + key)) {
                const cat = meta.category || 'Others';

                // 🧠 Xác định tab hiện tại
                const currentTabBtn = document.querySelector('.tab-button-vertical.active');
                let currentTabName = null;
                if (currentTabBtn) {
                    currentTabName = currentTabBtn.textContent;
                }


                // 🔍 Nếu tab hiện tại là tab của item → hoàn trả về tab đó
                if (currentTabName === cat) {
                    if (!document.getElementById('sidebar-' + key)) {
                        const newItem = createCanvasItem(key, meta);
                        newItem.id = 'sidebar-' + key;
                        const tabContent = document.querySelector('.tab-content');
                        if (tabContent) {
                            tabContent.appendChild(newItem);
                        } else {
                            sidebar.appendChild(newItem); // fallback
                        }
                    }
                }

                activeItems.delete(key);
                if (typeof saveItemStates === 'function') saveItemStates();
            }
            activeItems.delete(key);
        } else {
            let finalX = dropX;
            let finalY = dropY;

            if (snapEnabled && meta.targetPosition) {
                const dx = dropX - meta.targetPosition.x;
                const dy = dropY - meta.targetPosition.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const snapThreshold = 50;
                if (dist <= snapThreshold) {
                    finalX = meta.targetPosition.x;
                    finalY = meta.targetPosition.y;
                } else {
                    const snapped = snapToGrid(dropX, dropY);
                    finalX = snapped.x;
                    finalY = snapped.y;
                }
            } else {
                const snapped = snapToGrid(dropX, dropY);
                finalX = snapped.x;
                finalY = snapped.y;
            }


            canvas.style.left = finalX + 'px';
            canvas.style.top = finalY + 'px';
            canvas.style.zIndex = meta.layer || 0;
            canvas.dataset.position = JSON.stringify({
                x: finalX,
                y: finalY
            });
            canvas.dataset.key = key;
            saveItemStates();
            // console.log(`Item "${key}" position: (${finalX}, ${finalY})`);
        }
        if (!isRestoring) {
            saveItemStates();
        }
    };

    const onMouseDown = (e) => {
        if (canvas.dataset.locked === 'true') return;

        dragging = true;
        startDrag(e.clientX, e.clientY);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };
    const onMouseMove = (e) => {
        if (!dragging) return;
        updatePosition(e.clientX, e.clientY);
    };
    const onMouseUp = (e) => {
        if (!dragging) return;
        dragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        endDrag(e.clientX, e.clientY);
    };

    const onTouchStart = (e) => {
        if (canvas.dataset.locked === 'true') return;

        if (e.touches.length !== 1) return;
        dragging = true;
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
        document.addEventListener('touchmove', onTouchMove, {
            passive: false
        });
        document.addEventListener('touchend', onTouchEnd);
    };
    const onTouchMove = (e) => {
        if (!dragging || e.touches.length !== 1) return;
        e.preventDefault();
        const touch = e.touches[0];
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
        updatePosition(touch.clientX, touch.clientY);
    };
    const onTouchEnd = () => {
        if (!dragging) return;
        dragging = false;
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        endDrag(lastTouchX, lastTouchY);
    };

    if (isClone) {
        cloneCanvasHandler(canvas, initialPosition, meta, onMouseDown, onTouchStart, key);
    } else {
        activeItemsHandler(canvas, key, meta);
    }
    attachContextMenu(canvas, key, meta);
    return canvas;


}

function activeItemsHandler(canvas, key, meta) {
    canvas.id = 'sidebar-' + key;
    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (activeItems.has(key)) return;
        const sidebarRect = canvas.getBoundingClientRect();
        const gameRect = gameCanvas.getBoundingClientRect();
        const { scaleX, scaleY } = getGameCanvasScale();
        const offsetX = (e.clientX - sidebarRect.left) / scaleX;
        const offsetY = (e.clientY - sidebarRect.top) / scaleY;
        const posX = (e.clientX - gameRect.left) / scaleX - offsetX;
        const posY = (e.clientY - gameRect.top) / scaleY - offsetY;
        const clone = createCanvasItem(key, meta, true, {
            x: offsetX,
            y: offsetY
        }, {
            x: posX,
            y: posY
        });
        gameCanvas.appendChild(clone);
        activeItems.add(key);
        canvas.remove();
        const event = new MouseEvent('mousedown', {
            clientX: e.clientX,
            clientY: e.clientY
        });
        clone.dispatchEvent(event);
    });
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (activeItems.has(key)) return;
        const touch = e.touches[0];
        const sidebarRect = canvas.getBoundingClientRect();
        const gameRect = gameCanvas.getBoundingClientRect();
        const { scaleX, scaleY } = getGameCanvasScale();
        const offsetX = (touch.clientX - sidebarRect.left) / scaleX;
        const offsetY = (touch.clientY - sidebarRect.top) / scaleY;
        const posX = (touch.clientX - gameRect.left) / scaleX - offsetX;
        const posY = (touch.clientY - gameRect.top) / scaleY - offsetY;

        const clone = createCanvasItem(key, meta, true, {
            x: offsetX,
            y: offsetY
        }, {
            x: posX,
            y: posY
        });
        gameCanvas.appendChild(clone);
        activeItems.add(key);
        canvas.remove();
        clone.dispatchEvent(new TouchEvent('touchstart', {
            touches: [touch],
            cancelable: true,
            bubbles: true
        }));
    }, {
        passive: false
    });
}

function cloneCanvasHandler(canvas, initialPosition, meta, onMouseDown, onTouchStart, key) {
    canvas.style.left = initialPosition.x + 'px';
    canvas.style.top = initialPosition.y + 'px';
    canvas.style.zIndex = meta.layer || 0;

    // 🖱 Mouse down
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 2) return; // ✅ Chuột phải cho phép
        if (canvas.dataset.ignoreClick === 'true') return; // 🛑 Không drag, scale
        onMouseDown(e);
    });

    // ☝️ Touch start
    canvas.addEventListener('touchstart', (e) => {
        if (canvas.dataset.ignoreClick === 'true') return; // 🛑 Không drag cảm ứng
        onTouchStart(e);
    }, {
        passive: false
    });

    // 🔁 Hoàn trả (dblclick)
    canvas.addEventListener('dblclick', () => {
        if (canvas.dataset.ignoreClick === 'true') return;
        if (canvas.parentNode === gameCanvas) gameCanvas.removeChild(canvas);

        const cat = meta.category || 'Others';

        // 🧠 Xác định tab hiện tại
        const currentTabBtn = document.querySelector('.tab-button-vertical.active');
        let currentTabName = null;
        if (currentTabBtn) {
            currentTabName = currentTabBtn.textContent;
        }


        // 🔍 Nếu tab hiện tại là tab của item → hoàn trả về tab đó
        if (currentTabName === cat) {
            if (!document.getElementById('sidebar-' + key)) {
                const newItem = createCanvasItem(key, meta);
                newItem.id = 'sidebar-' + key;
                const tabContent = document.querySelector('.tab-content');
                if (tabContent) {
                    tabContent.appendChild(newItem);
                } else {
                    sidebar.appendChild(newItem); // fallback
                }
            }
        }

        activeItems.delete(key);
        if (typeof saveItemStates === 'function') saveItemStates();
    });
}