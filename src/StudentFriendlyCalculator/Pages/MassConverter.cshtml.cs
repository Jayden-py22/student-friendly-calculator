using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;
using System.Net.NetworkInformation;
using Antlr.Runtime;
namespace StudentFriendlyCalculator.Pages;

[IgnoreAntiforgeryToken]
public class MassConverterModel : PageModel
{
    private readonly ILogger<MassConverterModel> _logger;

    [BindProperty]
    public string FromUnit { get; set; }

    [BindProperty]
    public string ToUnit { get; set; }

    [BindProperty]
    public double Value { get; set; }

    public MassConverterModel(ILogger<MassConverterModel> logger)
    {
        _logger = logger;
    }

    public void OnGet()
    {
    }

    public IActionResult OnPostConverterSubmission(string FromUnit, string ToUnit, double Value)
    {
        try
        {
            double result = ConvertUnits(Value, FromUnit.ToLower(), ToUnit.ToLower());
            return new JsonResult(new { result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Conversion failed");
            return new JsonResult(new { error = ex.Message });
        }
    }


    private double ConvertUnits(double value, string fromUnit, string toUnit)
    {
        if (fromUnit == toUnit)
            return value;

        switch (fromUnit)
        {
            case "pound":
                switch (toUnit)
                {
                    case "gram": return value * 453.592;
                    case "kilogram": return value * 0.453592;
                    case "ton": return value * 0.000453592;
                    case "ounce": return value * 16;
                }
                break;
            case "gram":
                switch (toUnit)
                {
                    case "pound": return value / 453.592;
                    case "kilogram": return value / 1000;
                    case "ton": return value / 1_000_000;
                    case "ounce": return value / 28.3495;
                }
                break;
            case "kilogram":
                switch (toUnit)
                {
                    case "pound": return value / 0.453592;
                    case "gram": return value * 1000;
                    case "ton": return value / 1000;
                    case "ounce": return value * 35.274;
                }
                break;
            case "ton":
                switch (toUnit)
                {
                    case "pound": return value / 0.000453592;
                    case "gram": return value * 1_000_000;
                    case "kilogram": return value * 1000;
                    case "ounce": return value * 35274;
                }
                break;
            case "ounce":
                switch (toUnit)
                {
                    case "pound": return value / 16;
                    case "gram": return value * 28.3495;
                    case "kilogram": return value / 35.274;
                    case "ton": return value / 35274;
                }
                break;
        }

        throw new ArgumentException($"Unsupported conversion from '{fromUnit}' to '{toUnit}'.");
    }
}
