using Cinema.Controllers.DTO;
using Cinema.DBManager.Entities;
using Cinema.DBManager.Providers;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Cinema.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilmController : ControllerBase
    {
        FilmProvider filmProvider { get; set; }
        public FilmController(FilmProvider f)
        {
            filmProvider = f;
        }

        [HttpGet("ListaFilmova/{page}")]
        public async Task<IActionResult> ListaFilmova(int page = 0)
        {
            try
            {
                return Ok(filmProvider.GetAllMovies(page));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("BrojFilmova")]
        public async Task<IActionResult> BrojFilmova()
        {
            try
            {
                return Ok(filmProvider.MovieCount());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("Film/{id}")]
        public async Task<IActionResult> Film(string id)
        {
            try
            {
                return Ok(filmProvider.FindMovie(id));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("PostaviFilm")]
        public async Task<IActionResult> PostaviFilm([FromBody] FilmDTO film)
        {
            try
            {
                char[] del = { ' ', ',' };
                string z = film.Zanr?.Split(del).FirstOrDefault() ?? "Nepoznato";
                z = string.Concat(z.Where(c => !Path.GetInvalidFileNameChars().Contains(c)));
                z = Tools.TransliterateToAscii(z);
                string naziv = string.Concat(film.Naziv.Where(c => !Path.GetInvalidFileNameChars().Contains(c)));
                naziv = Tools.TransliterateToAscii(naziv);

                Console.WriteLine(film.Glumci[0].Ime);

                Film f = new Film
                {
                    ID = Guid.NewGuid().ToString(),
                    Naziv = naziv,
                    Zanr = Tools.TransliterateToAscii(film.Zanr!),
                    Opis = Tools.TransliterateToAscii(film.Opis),
                    DugiOpis = Tools.TransliterateToAscii(film.DugiOpis),
                    Reziser = Tools.TransliterateToAscii(film.Reziser),
                    Glumci = film.Glumci,
                    Slika = Path.Combine(z, Tools.removeSpace(naziv) + ".jpg")
                };

                filmProvider.InsertMovie(f);

                return Ok("Film je uspešno postavljen!");
            }
            catch (Exception ex)
            {
                return BadRequest("Došlo je do greške: " + ex.Message);
            }
        }

        [HttpPost("PostaviSliku")]
        public async Task<IActionResult> PostaviSliku([FromForm] ImageInfo film)
        {
            try
            {
                char[] del = { ' ', ',' };
                string z = film.Zanr?.Split(del).FirstOrDefault() ?? "Nepoznato";
                z = string.Concat(z.Where(c => !Path.GetInvalidFileNameChars().Contains(c)));
                z = Tools.TransliterateToAscii(z);
                string naziv = string.Concat(film.Naziv.Where(c => !Path.GetInvalidFileNameChars().Contains(c)));
                naziv = Tools.TransliterateToAscii(naziv);

                if (film.Slika != null && film.Slika.Length > 0)
                {
                    var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", z);
                    Directory.CreateDirectory(folderPath);

                    var filePath = Path.Combine(folderPath, Tools.removeSpace(naziv) + ".jpg");

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await film.Slika.CopyToAsync(stream);
                    }
                }

                return Ok("Slika je uspešno postavljena!");
            }
            catch (Exception ex)
            {
                return BadRequest("Došlo je do greške: " + ex.Message);
            }
        }

        [HttpPut("IzmeniFilm")]
        public async Task<IActionResult> IzmeniFilm([FromBody] FilmDTO film)
        {
            try
            {
                char[] del = { ' ', ',' };
                string z = film.Zanr?.Split(del).FirstOrDefault() ?? "Nepoznato";
                z = string.Concat(z.Where(c => !Path.GetInvalidFileNameChars().Contains(c)));
                z = Tools.TransliterateToAscii(z);
                string naziv = string.Concat(film.Naziv.Where(c => !Path.GetInvalidFileNameChars().Contains(c)));
                naziv = Tools.TransliterateToAscii(naziv);

                Console.WriteLine(film.Glumci[0].Ime);

                Film f = new Film
                {
                    ID = film.Id,
                    Naziv = naziv,
                    Zanr = Tools.TransliterateToAscii(film.Zanr!),
                    Opis = Tools.TransliterateToAscii(film.Opis),
                    DugiOpis = Tools.TransliterateToAscii(film.DugiOpis),
                    Reziser = Tools.TransliterateToAscii(film.Reziser),
                    Glumci = film.Glumci,
                    Slika = Path.Combine(z, Tools.removeSpace(naziv) + ".jpg")
                };

                filmProvider.UpdateMovie(f);

                return Ok("Film je uspešno postavljen!");
            }
            catch (Exception ex)
            {
                return BadRequest("Došlo je do greške: " + ex.Message);
            }
        }

        [HttpPut("IzmeniSliku")]
        public async Task<IActionResult> IzmeniSliku([FromForm] ImageInfo film)
        {
            try
            {
                char[] del = { ' ', ',' };
                string z = film.Zanr?.Split(del).FirstOrDefault() ?? "Nepoznato";
                z = string.Concat(z.Where(c => !Path.GetInvalidFileNameChars().Contains(c)));
                z = Tools.TransliterateToAscii(z);
                string naziv = string.Concat(film.Naziv.Where(c => !Path.GetInvalidFileNameChars().Contains(c)));
                naziv = Tools.TransliterateToAscii(naziv);

                if (film.Slika != null && film.Slika.Length > 0)
                {
                    var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", z);
                    Directory.CreateDirectory(folderPath);

                    var filePath = Path.Combine(folderPath, Tools.removeSpace(naziv) + ".jpg");

                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await film.Slika.CopyToAsync(stream);
                    }
                }

                return Ok("Slika je uspešno postavljena ili zamenjena!");
            }
            catch (Exception ex)
            {
                return BadRequest("Došlo je do greške: " + ex.Message);
            }
        }

        [HttpDelete("ObrisiFilm/{id}")]
        public async Task<IActionResult> ObrisiFilm(string id)
        {
            try
            {
                filmProvider.DeleteMovie(id);
                return Ok("Film je uspresno obrisan");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }

}
