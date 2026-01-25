import { DrawBioskopiPage } from "./Bioskopi.js";

// HEADER ZA ADMINA
export function DrawAdminHeader(host, activePage) {
    host.innerHTML = "";
    
    const navBar = document.createElement("div");
    navBar.classList.add("nav-bar");
    host.appendChild(navBar);

    const logo = document.createElement("div");
    logo.innerHTML = "🎬 CINEMA <span style='color:#000; background:#fff; padding: 2px 5px; border-radius:3px; margin-left:5px;'>ADMIN</span>";
    logo.classList.add("nav-logo");
    navBar.appendChild(logo);

    const linksContainer = document.createElement("div");
    linksContainer.classList.add("nav-links");
    navBar.appendChild(linksContainer);

    const createNavBtn = (label, pageKey, onClick) => {
        const btn = document.createElement("button");
        btn.innerText = label;
        btn.classList.add("nav-btn");
        if (activePage === pageKey) btn.classList.add("active");
        btn.onclick = onClick;
        linksContainer.appendChild(btn);
    };

    // BIOSKOPI (Admin)
    createNavBtn("BIOSKOPI", "bioskopi", () => {
        DrawBioskopiPage(true);
    });

    // FILMOVI
    createNavBtn("FILMOVI", "filmovi", () => {
        import("./main.js").then(m => {
            m.DrawAdminPage();
        });
    });

    // KORISNICI
    createNavBtn("KORISNICI", "korisnici", () => {
        import("./Korisnici.js").then(m => {
            const page = new m.KorisniciPage(host);
            page.DrawPage();
        });
    });

    // ODJAVA
    const btnLogout = document.createElement("button");
    btnLogout.innerText = "ODJAVI SE";
    btnLogout.classList.add("nav-btn-logout");
    btnLogout.onclick = () => {
        localStorage.clear();
        location.reload();
    };
    navBar.appendChild(btnLogout);
}


// HEADER ZA KORISNIKA

export function DrawUserHeader(host, activePage) {
    host.innerHTML = "";

    const navBar = document.createElement("div");
    navBar.classList.add("nav-bar");
    host.appendChild(navBar);

    const logo = document.createElement("div");
    logo.innerHTML = "🎬 CINEMA <span style='color:#39ff14'>APP</span>";
    logo.classList.add("nav-logo");
    navBar.appendChild(logo);

    const linksContainer = document.createElement("div");
    linksContainer.classList.add("nav-links");
    navBar.appendChild(linksContainer);

    const createNavBtn = (label, pageKey, onClick) => {
        const btn = document.createElement("button");
        btn.innerText = label;
        btn.classList.add("nav-btn");
        if (activePage === pageKey) btn.classList.add("active");
        btn.onclick = onClick;
        linksContainer.appendChild(btn);
    };

    // BIOSKOPI
    createNavBtn("BIOSKOPI", "bioskopi", () => {
        DrawBioskopiPage(false); // false = nije admin
    });

    // MOJE PROJEKCIJE 
    createNavBtn("MOJE REZERVACIJE", "mojeprojekcije", () => {
        import("./MojeProjekcije.js").then(m => {
            const page = new m.MojeProjekcijePage(host);
            page.DrawPage();
        });
    });

    // MOJ PROFIL
    createNavBtn("MOJ PROFIL", "profil", () => {
        import("./Profil.js").then(m => {
            const profilPage = new m.MojProfil(host);
            profilPage.DrawPage();
        });
    });

    // ODJAVA
    const btnLogout = document.createElement("button");
    btnLogout.innerText = "ODJAVI SE";
    btnLogout.classList.add("nav-btn-logout");
    btnLogout.onclick = () => {
        localStorage.clear();
        location.reload();
    };
    navBar.appendChild(btnLogout);
}