from django.db import models
from django.utils import timezone

# Simple User Model
class User(models.Model):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(max_length=254, unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    date_joined = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'users'


# Subscription Plans
class SubscriptionPlan(models.Model):
    PLAN_RESOLUTIONS = [
        ('SD', 'Standard Definition'),
        ('HD', 'High Definition'),
        ('4K', '4K Ultra HD')
    ]

    name = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    resolution = models.CharField(max_length=10, choices=PLAN_RESOLUTIONS)
    max_screens = models.PositiveIntegerField()

    def __str__(self):
        return self.name


# User Subscription
class UserSubscription(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Expired', 'Expired'),
        ('Cancelled', 'Cancelled')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')

    def __str__(self):
        return f"{self.user.username} - {self.plan.name}"


# Genre Model
class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


# Movie Model
class Movie(models.Model):
    AGE_RESTRICTIONS = [
        ('G', 'General Audience'),
        ('PG', 'Parental Guidance Suggested'),
        ('PG-13', 'Parents Strongly Cautioned'),
        ('R', 'Restricted'),
        ('NC-17', 'Adults Only')
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    release_year = models.PositiveIntegerField(default=2023)
    duration = models.PositiveIntegerField(help_text="Duration in minutes", default=0)
    language = models.CharField(max_length=50, default='English')
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    age_restriction = models.CharField(max_length=10, choices=AGE_RESTRICTIONS, default='PG')
    added_at = models.DateTimeField(default=timezone.now)
    genres = models.ManyToManyField(Genre, related_name="movies")

    def __str__(self):
        return self.title


# TV Show Model
class TVShow(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    release_year = models.PositiveIntegerField(default=2023)
    total_seasons = models.PositiveIntegerField(default=1)
    language = models.CharField(max_length=50, default='English')
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    age_restriction = models.CharField(max_length=10, choices=Movie.AGE_RESTRICTIONS, default='PG')
    added_at = models.DateTimeField(default=timezone.now)
    genres = models.ManyToManyField(Genre, related_name="tv_shows")

    def __str__(self):
        return self.title


# Season Model
class Season(models.Model):
    show = models.ForeignKey(TVShow, on_delete=models.CASCADE, related_name="seasons")
    season_number = models.PositiveIntegerField(default=1)
    release_year = models.PositiveIntegerField(default=2023)

    def __str__(self):
        return f"{self.show.title} - Season {self.season_number}"


# Episode Model
class Episode(models.Model):
    show = models.ForeignKey(TVShow, on_delete=models.CASCADE)
    season = models.ForeignKey(Season, on_delete=models.CASCADE, related_name="episodes")
    title = models.CharField(max_length=255)
    episode_number = models.PositiveIntegerField(default=1)
    duration = models.PositiveIntegerField(help_text="Duration in minutes", default=0)
    release_date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.show.title} - S{self.season.season_number}E{self.episode_number}: {self.title}"


# Actor Model
class Actor(models.Model):
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=100)

    def __str__(self):
        return self.full_name


# Movie Cast Model
class MovieCast(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    actor = models.ForeignKey(Actor, on_delete=models.CASCADE)
    role = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.actor.full_name} in {self.movie.title}"


# Show Cast Model
class ShowCast(models.Model):
    show = models.ForeignKey(TVShow, on_delete=models.CASCADE)
    actor = models.ForeignKey(Actor, on_delete=models.CASCADE)
    role = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.actor.full_name} in {self.show.title}"


# Watch History
class WatchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.SET_NULL, null=True, blank=True)
    episode = models.ForeignKey(Episode, on_delete=models.SET_NULL, null=True, blank=True)
    watched_on = models.DateTimeField(default=timezone.now)
    progress_percentage = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} watched {self.movie or self.episode}"


# User Ratings
class UserRating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.SET_NULL, null=True, blank=True)
    episode = models.ForeignKey(Episode, on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.PositiveIntegerField(default=0)
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} rated {self.movie or self.episode} {self.rating}"


# Payments Model
class Payment(models.Model):
    PAYMENT_METHODS = [
        ('Credit Card', 'Credit Card'),
        ('PayPal', 'PayPal'),
        ('Google Pay', 'Google Pay'),
        ('Apple Pay', 'Apple Pay')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHODS)
    transaction_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=[('Pending', 'Pending'), ('Completed', 'Completed'), ('Failed', 'Failed')], default='Completed')
    payment_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} - {self.amount}"


# Recommendations Model
class Recommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.SET_NULL, null=True, blank=True)
    show = models.ForeignKey(TVShow, on_delete=models.SET_NULL, null=True, blank=True)
    recommendation_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    def __str__(self):
        return f"Recommendation for {self.user.username}"


# Analytics Model
class Analytics(models.Model):
    EVENT_TYPES = [
        ('Play', 'Play'),
        ('Pause', 'Pause'),
        ('Stop', 'Stop'),
        ('Skip', 'Skip'),
        ('Rewind', 'Rewind')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=100, choices=EVENT_TYPES)
    movie = models.ForeignKey(Movie, on_delete=models.SET_NULL, null=True, blank=True)
    episode = models.ForeignKey(Episode, on_delete=models.SET_NULL, null=True, blank=True)
    event_timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} {self.event_type}"
