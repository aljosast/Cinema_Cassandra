 import { layout } from "./Filmovi.js"; // Ako koristis layout iz filma, ili napravi poseban layout za Home

export class Home {
    constructor(host, onLoginSuccess) {
        this.host = host;
        this.onLoginSuccess = onLoginSuccess;
        this.currentScroll = 0;
        this.autoScrollTimer = null;
    }

    async DrawHomePage() {
        this.host.innerHTML = "";
        
        // 1. POZADINA
        const bg = document.createElement("div");
        bg.classList.add("background-blur");
        const bgGrid = document.createElement("div");
        bgGrid.classList.add("bg-grid");
        bg.appendChild(bgGrid);
        this.host.appendChild(bg);

        // 2. HEADER
        const header = document.createElement("div");
        header.classList.add("neon-header");
        
        const titleDiv = document.createElement("div");
        titleDiv.innerText = "BIOSKOP APP";
        titleDiv.classList.add("header-title");
        header.appendChild(titleDiv);

        const linksDiv = document.createElement("div");
        linksDiv.classList.add("header-links");

        // Login
        const loginLink = document.createElement("button");
        loginLink.classList.add("text-link");
        loginLink.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg><span>PRIJAVI SE</span>`;
        loginLink.onclick = () => { this.DrawModal("Prijava"); }

        // Register
        const regLink = document.createElement("button");
        regLink.classList.add("text-link");
        regLink.innerHTML = `<svg viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg><span>REGISTRUJ SE</span>`;
        regLink.onclick = () => { this.DrawModal("Registracija"); }

        linksDiv.appendChild(loginLink);
        linksDiv.appendChild(regLink);
        header.appendChild(linksDiv);
        this.host.appendChild(header);

        // 3. CENTAR
        const mainContent = document.createElement("div");
        mainContent.classList.add("home-center");

        const subTitle = document.createElement("h3");
        subTitle.innerText = "AKTUELNO U PONUDI";
        subTitle.classList.add("neon-subtitle");
        mainContent.appendChild(subTitle);

        // 4. TRAKA
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

        // --- FETCH ---
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

                    // Traka - Dupliramo da bi bilo dovoljno za skrol
                    const loopFilmovi = [...filmovi, ...filmovi, ...filmovi]; 
                    
                    loopFilmovi.forEach(film => {
                        const frame = document.createElement("div");
                        frame.classList.add("film-frame");
                        
                        frame.onclick = () => { this.DrawFilmDetailsModal(film); };

                        const img = document.createElement("img");
                        img.src = "https://localhost:7172/images/" + film.slika;
                        img.onerror = function() { this.src = "https://via.placeholder.com/350x230/000000/39ff14?text=" + film.naziv; };
                        frame.appendChild(img);
                        strip.appendChild(frame);
                    });

                    // --- DINAMIČKA LOGIKA ZA POMERANJE ---
                    // Pomeramo se za širinu kontejnera (prikazujemo sledeći set od 4 filma)
                    // Ili za širinu jedne kartice ako želiš preciznije
                    
                    const moveStrip = () => {
                        strip.style.transform = `translateX(-${this.currentScroll}px)`;
                    };

                    const goRight = () => {
                        // Merimo širinu jednog elementa (filma) + gap (20px)
                        const itemWidth = strip.children[0].offsetWidth + 20; 
                        const maxScroll = (loopFilmovi.length * itemWidth) - container.offsetWidth;
                        
                        this.currentScroll += itemWidth; // Pomera 1 po 1
                        
                        if (this.currentScroll >= maxScroll) {
                            this.currentScroll = 0; 
                        }
                        moveStrip();
                    };

                    const goLeft = () => {
                        const itemWidth = strip.children[0].offsetWidth + 20;
                        const maxScroll = (loopFilmovi.length * itemWidth) - container.offsetWidth;

                        this.currentScroll -= itemWidth;
                        
                        if (this.currentScroll < 0) {
                             // Ako ode previše levo, vrati na kraj ali poravnato
                             this.currentScroll = maxScroll - (maxScroll % itemWidth); 
                        }
                        moveStrip();
                    };

                    arrowRight.onclick = () => { clearInterval(this.autoScrollTimer); goRight(); this.startAutoScroll(goRight); };
                    arrowLeft.onclick = () => { clearInterval(this.autoScrollTimer); goLeft(); this.startAutoScroll(goRight); };
                    this.startAutoScroll(goRight);
                }
            }
        } catch (error) { console.error(error); }
    }

    startAutoScroll(callback) {
        this.autoScrollTimer = setInterval(() => { callback(); }, 5000);
    }

    // --- MODAL DETALJI ---
    DrawFilmDetailsModal(film) {
        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.style.display = "block";

        const modalContent = document.createElement("div");
        // Dodajemo 'large-modal' klasu za širi prikaz
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
        `;
        
        let opisTekst = film.dugiOpis || "Nema dodatnog opisa.";
        info.innerHTML += `<p><span style="color:#39ff14; font-weight:bold">RADNJA:</span> ${opisTekst}</p>`;

        if(film.glumci && film.glumci.length > 0) {
            let glumciStr = film.glumci.map(g => g.ime).join(", ");
            info.innerHTML += `<p><span style="color:#39ff14; font-weight:bold">ULOGE:</span> ${glumciStr}</p>`;
        }

        layout.appendChild(info);
        modalContent.appendChild(layout);
        modal.appendChild(modalContent);
        this.host.appendChild(modal);
    }

    // --- MODAL LOGIN/REG ---
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

        const userIn = document.createElement("input");
        userIn.placeholder = "KORISNIČKO IME";
        userIn.classList.add("neon-input");
        modalContent.appendChild(userIn);

        const passIn = document.createElement("input");
        passIn.type = "password";
        passIn.placeholder = "LOZINKA";
        passIn.classList.add("neon-input");
        modalContent.appendChild(passIn);

        if(tip === "Registracija"){
            const emailIn = document.createElement("input");
            emailIn.placeholder = "EMAIL ADRESA";
            emailIn.classList.add("neon-input");
            modalContent.insertBefore(emailIn, passIn);
        }

        const confirmBtn = document.createElement("button");
        confirmBtn.innerText = "POTVRDI";
        confirmBtn.classList.add("modal-text-btn");
        
        confirmBtn.onclick = () => {
            if(userIn.value !== "" && passIn.value !== "") {
                modal.remove();
                if(this.onLoginSuccess) this.onLoginSuccess();
            } else {
                alert("Popunite sva polja!");
            }
        };
        modalContent.appendChild(confirmBtn);
        modal.appendChild(modalContent);
        this.host.appendChild(modal);
    }
}