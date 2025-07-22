import { saveItemStates } from "./stateManager.js";

const contextMenu = document.getElementById('contextMenu');
let contextTarget = null;
let contextKey = null;
let contextMeta = null;

// Ngăn context menu bị ẩn khi click vào bên trong nó
contextMenu.addEventListener("click", (e) => e.stopPropagation());

// Tạo lại nội dung context menu
function renderContextMenu(canvas, key, meta, pageX, pageY) {
    const pos = JSON.parse(canvas.dataset.position || '{}');
    const locked = canvas.dataset.locked === 'true';
    const ignoreClick = canvas.dataset.ignoreClick === 'true';
    const layer = canvas.dataset.layer || meta.layer || 0;

    contextMenu.innerHTML = `
        <button disabled>🔍 <b>${key}</b> — (${pos.x ?? 0}, ${pos.y ?? 0}) — Layer ${layer}</button>
        <button id="toggleLock">${locked ? '🔓 Mở khóa vị trí' : '🔒 Khóa vị trí'}</button>
        <button id="toggleClick">${ignoreClick ? '🖱️ Cho phép click trái' : '🚫 Bỏ qua click trái'}</button>
        <div style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: #ffe0f0; border-radius: 12px; margin-top: 4px; font-weight: bold; color: #c2185b;">
            Layer:
            <input id="layerInput" type="number" value="${layer}"
                style="width: 48px; padding: 2px 6px; border: none; border-radius: 6px; font-size: 14px; background: #fff0f6; color: #880e4f;" />
        </div>
    `;

    contextMenu.style.left = `${pageX}px`;
    contextMenu.style.top = `${pageY}px`;
    contextMenu.style.display = 'block';

    // Layer input
    // Layer input
    const layerInput = document.getElementById("layerInput");
    if (layerInput) {
        layerInput.addEventListener("change", () => {
            const newLayer = parseInt(layerInput.value);
            if (!isNaN(newLayer)) {
                contextTarget.dataset.layer = newLayer;
                contextMeta.layer = newLayer;
                contextTarget.style.zIndex = newLayer;

                // ✅ Lưu lại localStorage
                if (typeof saveItemStates === 'function') saveItemStates();

                // ✅ Cập nhật lại nội dung context menu cho khớp
                renderContextMenu(contextTarget, contextKey, contextMeta, parseInt(contextMenu.style.left), parseInt(contextMenu.style.top));
            }
        });
    }

}

// Gắn context menu cho canvas item
export function attachContextMenu(canvas, key, meta) {
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        contextTarget = canvas;
        contextKey = key;
        contextMeta = meta;

        renderContextMenu(canvas, key, meta, e.pageX, e.pageY);
    });
}

// Click ngoài thì ẩn menu
window.addEventListener("click", (e) => {
    if (!contextMenu.contains(e.target)) {
        contextMenu.style.display = "none";
    }
});

// Xử lý click các nút trong menu
contextMenu.addEventListener('click', (e) => {
    if (!contextTarget) return;
    const id = e.target.id;

    if (id === 'toggleLock') {
        const isLocked = contextTarget.dataset.locked === 'true';
        contextTarget.dataset.locked = (!isLocked).toString();
        if (typeof saveItemStates === 'function') saveItemStates();
        renderContextMenu(contextTarget, contextKey, contextMeta, parseInt(contextMenu.style.left), parseInt(contextMenu.style.top));
    }

    if (id === 'toggleClick') {
        const ignoreClick = contextTarget.dataset.ignoreClick === 'true';
        contextTarget.dataset.ignoreClick = (!ignoreClick).toString();
        if (typeof saveItemStates === 'function') saveItemStates();
        renderContextMenu(contextTarget, contextKey, contextMeta, parseInt(contextMenu.style.left), parseInt(contextMenu.style.top));
    }
});