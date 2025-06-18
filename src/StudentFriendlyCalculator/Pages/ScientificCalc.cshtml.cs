using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NCalc;

namespace StudentFriendlyCalculator.Pages;

[IgnoreAntiforgeryToken]


public class ScientificCalcModel : PageModel
{
    private readonly ILogger<ScientificCalcModel> _logger;

    public ScientificCalcModel(ILogger<ScientificCalcModel> logger)
    {
        _logger = logger;
    }

    public void OnGet()
    {
    }

    public class UserInput
    {
        public required string Name { get; set; }
    }
    

    public async Task<IActionResult> OnPostCalcSubmissionAsync()
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();
        var data = System.Text.Json.JsonSerializer.Deserialize<UserInput>(body);

        if (data == null || string.IsNullOrWhiteSpace(data.Name))
        {
            return new JsonResult(new { error = "Empty input" });
        }

        try
        {
            string expressionString = data.Name;

            // OPTIONAL: strip whitespace to avoid "5 !" breaking the regex
            expressionString = expressionString.Replace(" ", "");

            Console.WriteLine("Before regex: {expression}", expressionString);

            // Replace number! with fact(number)
            expressionString = System.Text.RegularExpressions.Regex.Replace(
                expressionString,
                @"(\d+)!",
                match =>
                {
                    var number = match.Groups[1].Value;
                    return $"fact({number})";
                }
            );

            Console.WriteLine("After regex: {expression}", expressionString);

            _logger.LogInformation("Parsed expression: {parsed}", expressionString);

            var expr = new Expression(expressionString);

            // Register custom factorial function
            expr.EvaluateFunction += (name, args) =>
            {
                if (name.Equals("fact", StringComparison.OrdinalIgnoreCase))
                {
                    if (args.Parameters.Length != 1 || args.Parameters[0] == null)
                        throw new ArgumentException("Factorial takes one argument");

                    int n = Convert.ToInt32(args.Parameters[0]);
                    if (n < 0) throw new ArgumentException("Negative factorial not allowed");

                    int result = 1;
                    for (int i = 2; i <= n; i++)
                        result *= i;

                    args.Result = result;
                }
            };

            var result = expr.Evaluate();
            return new JsonResult(new { result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Expression evaluation failed");
            return new JsonResult(new { error = "Invalid expression" });
        }
    }



}

