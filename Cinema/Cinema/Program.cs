using Cinema.DBManager.Providers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddScoped<FilmProvider>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CORS", policy =>
    {
        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .WithOrigins("http://localhost:5500",
                "https://localhost:5500",
                "http://127.0.0.1:5500",
                "https://127.0.0.1:5500");
    });
});

builder.Services.AddControllers(); 
//builder.WebHost.UseUrls("http://0.0.0.0:5000");


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var imagesPath = builder.Configuration["Storage:ImagesPath"];

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();  // Omoguæite statièke fajlove iz wwwroot

// Mapirajte rutu koja vodi do index.html fajla
app.Map("/Filmovi", async context =>
{
    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html");
    if (File.Exists(filePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(filePath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("File not found.");
    }
});

app.UseCors("CORS");

app.UseHttpsRedirection();

app.UseAuthentication();

app.MapControllers();

app.Run();