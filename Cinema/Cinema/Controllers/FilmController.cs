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
        public async Task<IActionResult> PostaviFilm([FromForm] FilmDTO film)
        {
            try
            {
                
                string naziv = string.Concat(film.Naziv.Where(c => !Path.GetInvalidFileNameChars().Contains(c)));
                naziv = Tools.TransliterateToAscii(naziv);

                var FID = Guid.NewGuid().ToString();

                Film f = new Film
                {
                    ID = FID,
                    Naziv = naziv,
                    Zanr = Tools.TransliterateToAscii(film.Zanr!),
                    Opis = Tools.TransliterateToAscii(film.Opis),
                    DugiOpis = Tools.TransliterateToAscii(film.DugiOpis),
                    Reziser = Tools.TransliterateToAscii(film.Reziser),
                    Glumci = film.Glumci,
                    Slika = Path.Combine(FID + ".jpg")
                };

                filmProvider.InsertMovie(f);

                if (film.Slika != null && film.Slika.Length > 0)
                {
                    var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                    Directory.CreateDirectory(folderPath);

                    var filePath = Path.Combine(folderPath, FID + ".jpg");

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await film.Slika.CopyToAsync(stream);
                    }
                }

                return Ok("Film je uspešno postavljen!");
            }
            catch (Exception ex)
            {
                return BadRequest("Došlo je do greške: " + ex.Message);
            }
        }

        [HttpPut("IzmeniFilm")]
        public async Task<IActionResult> IzmeniFilm([FromForm] FilmDTO film)
        {
            try
            {
                string naziv = string.Concat(film.Naziv.Where(c => !Path.GetInvalidFileNameChars().Contains(c)));
                naziv = Tools.TransliterateToAscii(naziv);

                var FID = film.Id;

                Film f = new Film
                {
                    ID = FID,
                    Naziv = naziv,
                    Zanr = Tools.TransliterateToAscii(film.Zanr!),
                    Opis = Tools.TransliterateToAscii(film.Opis),
                    DugiOpis = Tools.TransliterateToAscii(film.DugiOpis),
                    Reziser = Tools.TransliterateToAscii(film.Reziser),
                    Glumci = film.Glumci,
                    Slika = Path.Combine(FID + ".jpg")
                };

                filmProvider.InsertMovie(f);

                if (film.Slika != null && film.Slika.Length > 0)
                {
                    var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                    Directory.CreateDirectory(folderPath);

                    var filePath = Path.Combine(folderPath, FID + ".jpg");

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await film.Slika.CopyToAsync(stream);
                    }
                }

                return Ok("Film je uspešno postavljen!");
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
