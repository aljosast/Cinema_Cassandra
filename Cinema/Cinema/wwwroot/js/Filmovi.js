  import { DrawInsertPage, DrawAdminPage } from "./main.js";

// Klasa za prikaz filma u Admin panelu
export class Filmovi {
    constructor(host, id, naziv, zanr, reziser, dugiOpis, opis, slika, glumci) {
        this.host = host;
        this.id = id;
        this.naziv = naziv;
        this.zanr = zanr;
        this.reziser = reziser;
        this.opis = opis;
        this.dugiOpis = dugiOpis;
        this.slika = slika;
        this.glumci = glumci;
        
        this.modal = document.createElement("div");
        this.modal.classList.add("modal");
        document.body.appendChild(this.modal); 
    }

    Kartica() {
        const card = document.createElement("div");
        card.classList.add("movie-card");
        this.host.appendChild(card);

        card.onclick = () => { this.OtvoriModal(); }

        const img = document.createElement("img");
        img.src = this.slika ? "images/" + this.slika : "https://via.placeholder.com/300x450?text=No+Image"; 
        img.onerror = function() { this.src = "https://via.placeholder.com/300x450?text=Error"; };
        card.appendChild(img);

        const info = document.createElement("div");
        info.classList.add("movie-card-info");
        
        const title = document.createElement("div");
        title.innerText = this.naziv;
        title.classList.add("movie-card-title");
        info.appendChild(title);

        const zanr = document.createElement("div");
        zanr.innerText = this.zanr;
        zanr.classList.add("movie-card-genre");
        info.appendChild(zanr);

        card.appendChild(info);
    }

    OtvoriModal() {
        this.modal.innerHTML = "";
        this.modal.style.display = "block";
        
        const modalContent = document.createElement("div");
        modalContent.classList.add("neon-modal", "large-modal");
        
        const closeIcon = document.createElement("button");
        closeIcon.innerHTML = "&times;";
        closeIcon.classList.add("modal-close-icon");
        closeIcon.onclick = () => { this.modal.style.display = "none"; };
        modalContent.appendChild(closeIcon);

        const layout = document.createElement("div");
        layout.classList.add("film-details-layout");

        const img = document.createElement("img");
        img.classList.add("film-details-img");
        img.src = "images/" + this.slika;
        img.onerror = function() { this.style.display='none'; };
        layout.appendChild(img);

        const info = document.createElement("div");
        info.classList.add("film-details-info");

        info.innerHTML = `
            <h2>${this.naziv}</h2>
            <p><span class="label">ŽANR:</span> ${this.zanr}</p>
            <p><span class="label">REŽISER:</span> ${this.reziser}</p>
            <p><span class="label">OPIS:</span> ${this.opis}</p>
            <p><span class="label">RADNJA:</span> ${this.dugiOpis || "/"}</p>
        `;

        if(this.glumci && this.glumci.length > 0) {
            let glumciStr = this.glumci.map(g => g.ime).join(", ");
            info.innerHTML += `<p><span class="label">ULOGE:</span> ${glumciStr}</p>`;
        }

        const btnRow = document.createElement("div");
        btnRow.classList.add("admin-btn-row");

        const editBtn = document.createElement("button");
        editBtn.innerText = "IZMENI FILM";
        editBtn.classList.add("btn-edit");
        editBtn.onclick = () => {
            this.modal.style.display = "none";
            DrawInsertPage(this.id, this.naziv, this.zanr, this.opis, this.dugiOpis, this.reziser, this.slika, this.glumci, true);
        };
        btnRow.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.innerText = "OBRIŠI FILM";
        delBtn.classList.add("btn-delete");
        delBtn.onclick = () => {
            if(confirm("Da li ste sigurni da želite da trajno obrišete ovaj film?")) {
                this.modal.style.display = "none";
                obrisifilm(this.id);
            }
        };
        btnRow.appendChild(delBtn);

        info.appendChild(btnRow);
        layout.appendChild(info);
        modalContent.appendChild(layout);
        this.modal.appendChild(modalContent);
    }
}

// OVO JE FUNKCIJA KOJU SI TRAŽIO
export function layout(host) {
    const header = document.createElement("div");
    header.classList.add("neon-header");
    host.appendChild(header);

    const titleDiv = document.createElement("div");
    titleDiv.innerText = "ADMIN PANEL";
    titleDiv.classList.add("header-title");
    header.appendChild(titleDiv);

    const linksDiv = document.createElement("div");
    linksDiv.classList.add("header-links");

    
    const moviesBtn1 = document.createElement("button");
    moviesBtn1.innerText = "FILMOVI"; // Skrati naziv
    moviesBtn1.classList.add("text-link");
    moviesBtn1.onclick = () => { 
        // Ovde moramo uvesti DrawAdminPage iz main.js ako nije dostupno
        // Ali pošto je kružni import, najbolje je uraditi ovo:
        import("./main.js").then(m => m.DrawAdminPage());
    };
    linksDiv.appendChild(moviesBtn1);
    
    // --- NOVO DUGME ---
    const cinemaBtn = document.createElement("button");
    cinemaBtn.innerText = "BIOSKOPI";
    cinemaBtn.classList.add("text-link");
    cinemaBtn.onclick = () => { 
        // Dinamički importujemo Bioskopi.js i pozivamo crtanje
        import("./Bioskopi.js").then(module => module.DrawBioskopiPage());
    };
    linksDiv.appendChild(cinemaBtn);
    
    const logoutBtn = document.createElement("button");
    logoutBtn.innerText = "ODJAVI SE";
    logoutBtn.classList.add("text-link");
    logoutBtn.onclick = () => { location.reload(); }; 
    linksDiv.appendChild(logoutBtn);
    header.appendChild(linksDiv);
}

async function obrisifilm(id) {
    try {
        const response = await fetch(`https://localhost:7172/api/Film/ObrisiFilm/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
            alert("Film je uspešno obrisan!");
            DrawAdminPage(); 
        } else {
            alert("Greška pri brisanju.");
        }
    } catch (error) { console.error(error); }
}