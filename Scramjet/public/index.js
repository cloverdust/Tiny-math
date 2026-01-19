const { ScramjetController } = $scramjetLoadController();

let f = null;
const content = document.getElementById("content"); // REQUIRED container

function url(input, template) {
	try {
		return new URL(input).toString();
	} catch {}

	try {
		const u = new URL(`http://${input}`);
		if (u.hostname.includes(".")) return u.toString();
	} catch {}

	return template.replace("%s", encodeURIComponent(input));
}

async function sw() {
	if (!("serviceWorker" in navigator)) {
		throw new Error("Service workers not supported");
	}

	const reg = await navigator.serviceWorker.getRegistration();
	if (!reg) {
		await navigator.serviceWorker.register("/sw.js", { scope: "/" });
	}
}

const scramjet = new ScramjetController({
	files: {
		wasm: "/scram/scramjet.wasm",
		all: "/scram/scramjet.all.js",
		sync: "/scram/scramjet.sync.js",
	}
});
scramjet.init();

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

async function surf(u) {
	await sw();

	const wispUrl =
		(location.protocol === "https:" ? "wss://" : "ws://") +
		location.host +
		"/wisp/";

	if ((await connection.getTransport()) !== "/epoxy/index.mjs") {
		await connection.setTransport("/epoxy/index.mjs", [
			{ wisp: wispUrl }
		]);
	}

	if (!f) {
		f = scramjet.createFrame();
		content.appendChild(f.frame);
		content.style.display = "block";
	}

	f.go(u);
}

const innerForm = document.querySelector("#inner form");
const innerFormInput = innerForm?.querySelector("input");

innerForm?.addEventListener("submit", e => {
	e.preventDefault();
	if (!innerFormInput?.value) return;

	const u = url(innerFormInput.value, "https://duckduckgo.com/?q=%s");
	surf(u).catch(err => {
		console.error(err);
		alert("Failed to load site.");
	});
});
