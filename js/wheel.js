var wheel = new Vue({
    el: '#app',
    data: function () {
        return {
            api: 'https://steam.cma.dk/',
            enable_sound: true,
            loading: false,
            spinning: false,
            categories: [],
            genres: [],
            games: [],
            selectedCategory: null,
            selectedGenre: null,
            username: null,
            free: 0,
            non_vr: 0,
            mp3: new Audio('./music/thewheelhausaudio.mp3'),
            deg: 0,
            target: 0,
            winner: null
        };
    },
    mounted: function () {
        this.$_loadCategories();
        this.$_loadGenres();
    },
    methods: {
        $_loadGames: function (callback) {
            this.games = [];

            $.ajax({
                url: this.api + 'apps',
                method: 'get',
                data: {
                    category: this.selectedCategory,
                    genre: this.selectedGenre,
                    free: this.free,
                    non_vr: this.non_vr,
                    username: this.username || null,
                },
                cache: false,
                success: function(games) {
                    this.games = games;

                    this.$nextTick(callback);
                }.bind(this)
            });
        },
        $_loadCategories: function () {
            $.ajax({
                url: this.api + 'categories',
                method: 'get',
                success: function(categories) {
                    categories.sort(this.$_sort);

                    this.categories = categories;
                }.bind(this)
            });
        },
        $_loadGenres: function () {
            $.ajax({
                url: this.api + 'genres',
                method: 'get',
                success: function(genres) {
                    genres.sort(this.$_sort);

                    this.genres = genres;
                }.bind(this)
            });
        },
        $_playSound: function () {
            if (this.enable_sound) {
                if (this.mp3.paused)
                    this.mp3.play();
                else
                    this.mp3.pause();
            }
        },
        $_spinWheel: function () {
            this.spinning = true;
            this.winner = null;
            this.$_playSound();

            this.deg = this.$_ordSequential();
            this.target = (this.deg - (360 * parseInt(this.deg / 360))) / 45;

            $(this.$refs['wheel'].childNodes).velocity({
                opacity: 1
            }, {
                duration: 0,
                complete: function() {
                    $(this.$refs['wheel']).velocity({
                        rotateZ: "-" + this.deg + "deg"
                    }, {
                        duration: 4000,
                        complete: function(elements) {
                            // after spinning animation is completed, set opacity of target segment's parent
                            $(this.$refs['game_' + this.target]).velocity({
                                opacity: 0.4
                            }, {
                                duration: 100,
                                complete: function() {
                                    this.winner = this.games[this.target];

                                    this.spinning = false;
                                }.bind(this) // third animation completed
                            }); // nested velocity 2
                        }.bind(this) // second animation completed
                    }); // nested velocity 1
                }.bind(this) // first animation completed
            }); // velocity
        },
        spin: function () {
            this.loading = true;

            this.$_loadGames(function () {
                this.loading = false;

                this.$_spinWheel();
            }.bind(this));
        },
        $_ordSequential: function () {
            return this.deg + (45 * 3) + 1080;
        },
        startPlaying: function () {
            window.location.href = "steam://run/" + this.winner.id;
        },
        $_sort: function (a, b) {
            if (a.name < b.name) {
                return -1;
            }
            if (b.name < a.name) {
                return 1;
            }
            return 0;
        }
    }
});