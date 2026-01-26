import { layout } from "./Filmovi.js"; 

export class Home {
    constructor(host, onLoginSuccess) {
        this.host = host;
        this.onLoginSuccess = onLoginSuccess; 
        this.currentScroll = 0;
        this.autoScrollTimer = null;
    }

    async DrawHomePage() {
        this.host.innerHTML = "";
        
        //  POZADINA I HEADER
        const bg = document.createElement("div");
        bg.classList.add("background-blur");
        const bgGrid = document.createElement("div");
        bgGrid.classList.add("bg-grid");
        bg.appendChild(bgGrid);
        this.host.appendChild(bg);

        const header = document.createElement("div");
        header.classList.add("neon-header");
        
        const titleDiv = document.createElement("div");
        titleDiv.innerText = "BIOSKOP APP";
        titleDiv.classList.add("header-title");
        header.appendChild(titleDiv);

        const linksDiv = document.createElement("div");
        linksDiv.classList.add("header-links");

        const loginLink = document.createElement("button");
        loginLink.classList.add("text-link");
        loginLink.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>PRIJAVI SE</span>
        `;
        loginLink.onclick = () => { this.DrawModal("Prijava"); }

        const regLink = document.createElement("button");
        regLink.classList.add("text-link");
        regLink.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>REGISTRUJ SE</span>
        `;
        regLink.onclick = () => { this.DrawModal("Registracija"); }

        linksDiv.appendChild(loginLink);
        linksDiv.appendChild(regLink);
        header.appendChild(linksDiv);
        this.host.appendChild(header);

        // SADRŽAJ (Filmovi)
        const mainContent = document.createElement("div");
        mainContent.classList.add("home-center");

        const subTitle = document.createElement("h3");
        subTitle.innerText = "AKTUELNO U PONUDI";
        subTitle.classList.add("neon-subtitle");
        mainContent.appendChild(subTitle);

        const wrapper = document.createElement("div");
        wrapper.classList.add("film-strip-wrapper");

        const arrowLeft = document.createElement("button");
        arrowLeft.innerHTML = "&#8249;"; 
        arrowLeft.classList.add("nav-arrow", "arrow-left");
        wrapper.appendChild(arrowLeft);

        const container = document.createElement("div");
        container.classList.add("film-strip-container");
        
        const strip = document.createElement("div");
        strip.classList.add("film-strip");
        container.appendChild(strip);
        
        wrapper.appendChild(container);

        const arrowRight = document.createElement("button");
        arrowRight.innerHTML = "&#8250;"; 
        arrowRight.classList.add("nav-arrow", "arrow-right");
        wrapper.appendChild(arrowRight);

        mainContent.appendChild(wrapper);
        this.host.appendChild(mainContent);

        //  FETCH FILMOVA
        try {
            const response = await fetch("https://localhost:7172/api/Film/ListaFilmova/0");
            if(response.ok) {
                let filmovi = await response.json();
                if(filmovi.length > 0) {
                    // Pozadina
                    filmovi.slice(0, 4).forEach(film => {
                        const img = document.createElement("img");
                        img.src = "https://localhost:7172/images/" + film.slika;
                        img.onerror = function() { this.style.display = 'none'; };
                        bgGrid.appendChild(img);
                    });

                    // Traka
                    const loopFilmovi = [...filmovi, ...filmovi, ...filmovi]; 
                    loopFilmovi.forEach(film => {
                        const frame = document.createElement("div");
                        frame.classList.add("film-frame");
                        frame.onclick = () => { this.DrawFilmDetailsModal(film); };

                        const img = document.createElement("img");
                        img.src = "https://localhost:7172/images/" + film.slika;
                        img.onerror = function() { this.src = "https://via.placeholder.com/300x450?text=" + film.naziv; };
                        frame.appendChild(img);
                        strip.appendChild(frame);
                    });

                    // Skrolovanje
                    const moveStrip = () => { strip.style.transform = `translateX(-${this.currentScroll}px)`; };
                    const goRight = () => {
                        const itemWidth = 350; 
                        const maxScroll = (loopFilmovi.length * itemWidth) - container.offsetWidth;
                        this.currentScroll += itemWidth; 
                        if (this.currentScroll >= maxScroll) this.currentScroll = 0; 
                        moveStrip();
                    };
                    const goLeft = () => {
                        const itemWidth = 350; 
                        const maxScroll = (loopFilmovi.length * itemWidth) - container.offsetWidth;
                        this.currentScroll -= itemWidth; 
                        if (this.currentScroll < 0) this.currentScroll = maxScroll - (maxScroll % itemWidth); 
                        moveStrip();
                    };
                    arrowRight.onclick = () => { clearInterval(this.autoScrollTimer); goRight(); this.startAutoScroll(goRight); };
                    arrowLeft.onclick = () => { clearInterval(this.autoScrollTimer); goLeft(); this.startAutoScroll(goRight); };
                    this.startAutoScroll(goRight);
                }
            }
        } catch (error) { console.error("Greska:", error); }
    }

    startAutoScroll(callback) {
        if(this.autoScrollTimer) clearInterval(this.autoScrollTimer);
        this.autoScrollTimer = setInterval(() => { callback(); }, 5000);
    }

    DrawFilmDetailsModal(film) {
        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.style.display = "block";

        const modalContent = document.createElement("div");
        modalContent.classList.add("neon-modal", "large-modal");
        
        const closeIcon = document.createElement("button");
        closeIcon.innerHTML = "&times;";
        closeIcon.classList.add("modal-close-icon");
        closeIcon.onclick = () => modal.remove();
        modalContent.appendChild(closeIcon);

        const layout = document.createElement("div");
        layout.classList.add("film-details-layout");

        const img = document.createElement("img");
        img.src = "https://localhost:7172/images/" + film.slika;
        img.classList.add("film-details-img");
        layout.appendChild(img);

        const info = document.createElement("div");
        info.classList.add("film-details-info");
        info.innerHTML = `
            <h2>${film.naziv}</h2>
            <p><span style="color:#39ff14; font-weight:bold">ŽANR:</span> ${film.zanr}</p>
            <p><span style="color:#39ff14; font-weight:bold">REŽISER:</span> ${film.reziser}</p>
            <p><span style="color:#39ff14; font-weight:bold">OPIS:</span> ${film.opis}</p>
            <p><span style="color:#39ff14; font-weight:bold">RADNJA:</span> ${film.dugiOpis || "/"}</p>
        `;
        layout.appendChild(info);
        modalContent.appendChild(layout);
        modal.appendChild(modalContent);
        this.host.appendChild(modal);
    }

    // LOGIKA ZA PRIJAVU I REGISTRACIJU
    DrawModal(tip) {
        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.style.display = "block";

        const modalContent = document.createElement("div");
        modalContent.classList.add("neon-modal");

        const closeIcon = document.createElement("button");
        closeIcon.innerHTML = "&times;";
        closeIcon.classList.add("modal-close-icon");
        closeIcon.onclick = () => modal.remove();
        modalContent.appendChild(closeIcon);

        const naslov = document.createElement("h2");
        naslov.innerText = tip.toUpperCase();
        naslov.style.color = "#fff";
        modalContent.appendChild(naslov);

        // Input polja
        let imeIn = null, prezimeIn = null, godineIn = null;

        if(tip === "Registracija") {
            imeIn = document.createElement("input"); imeIn.placeholder = "IME"; imeIn.classList.add("neon-input");
            modalContent.appendChild(imeIn);

            prezimeIn = document.createElement("input"); prezimeIn.placeholder = "PREZIME"; prezimeIn.classList.add("neon-input");
            modalContent.appendChild(prezimeIn);

            godineIn = document.createElement("input"); godineIn.type = "number"; godineIn.placeholder = "GODINE"; godineIn.classList.add("neon-input");
            modalContent.appendChild(godineIn);
        }

        const userIn = document.createElement("input"); userIn.placeholder = "KORISNIČKO IME"; userIn.classList.add("neon-input");
        modalContent.appendChild(userIn);

        const passIn = document.createElement("input"); passIn.type = "password"; passIn.placeholder = "LOZINKA"; passIn.classList.add("neon-input");
        modalContent.appendChild(passIn);

        // Mesto za greške
        const msgDiv = document.createElement("div");
        msgDiv.style.color = "#39ff14"; 
        msgDiv.style.fontSize = "0.8rem"; 
        msgDiv.style.marginTop = "15px";
        msgDiv.style.textAlign = "center";
        msgDiv.style.textShadow = "0 0 5px #39ff14";
        modalContent.appendChild(msgDiv);

        const confirmBtn = document.createElement("button");
        confirmBtn.innerText = "POTVRDI";
        confirmBtn.classList.add("modal-text-btn");
        
        confirmBtn.onclick = async () => {
            msgDiv.innerText = "";
            
            // Validacija polja
            if (tip === "Prijava") {
                if(!userIn.value || !passIn.value) { msgDiv.innerText = "Unesite korisničko ime i lozinku."; return; }
            } else {
                if(!userIn.value || !passIn.value || !imeIn.value || !prezimeIn.value || !godineIn.value) {
                    msgDiv.innerText = "Sva polja su obavezna."; return;
                }
            }

            // REGISTRACIJA 
            if(tip === "Registracija") {
                const registracijaPodaci = {
                    username: userIn.value,
                    password: passIn.value,
                    ime: imeIn.value,
                    prezime: prezimeIn.value,
                    godine: parseInt(godineIn.value),
                    role: "User" 
                };

                try {
                    const resp = await fetch("https://localhost:7172/api/Korisnik/Registracija", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(registracijaPodaci)
                    });

                    if(resp.ok) {
                        alert("Uspešna registracija! Sada se prijavite.");
                        modal.remove();
                        this.DrawModal("Prijava");
                    } else {
                        const errorText = await resp.text();
                        msgDiv.innerText = errorText; 
                    }
                } catch(e) { console.error(e); msgDiv.innerText = "Greška servera."; }

            } else {
                //  PRIJAVA (LOGIN)
                const loginPodaci = {
                    username: userIn.value,
                    password: passIn.value
                };

                try {
                    const resp = await fetch("https://localhost:7172/api/Korisnik/Prijava", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(loginPodaci)
                    });

                    if(resp.ok) {
                        // 1. PRVO PARSIRAMO PODATKE
                        const data = await resp.json(); 
                        console.log(`Data.token = ${data.token}`)
                        
                        // 2. ONDA IH KORISTIMO I ČUVAMO
                        localStorage.setItem("username", data.username);
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("role", data.role);

                        modal.remove();
                        
                        if(this.onLoginSuccess) this.onLoginSuccess(data.role); 
                    } else {
                        const errorData = await resp.json(); 
                        msgDiv.innerText = errorData.invalidMessage || "Pogrešni podaci.";
                    }
                } catch(e) { 
                    console.error(e); 
                    msgDiv.innerText = "Greška servera (Da li ste restartovali C#?)."; 
                }
            }
        };

        modalContent.appendChild(confirmBtn);
        modal.appendChild(modalContent);
        this.host.appendChild(modal);
    }
}