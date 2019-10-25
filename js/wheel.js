Vue.component('wheel', {
    props: {
        api: {
            type: String,
            required: true
        },
        value: {
            type: Object
        },
        enableSound: {
            type: Boolean,
            default: true
        },
        category: null,
        genre: null,
        tag: null,
        username: null,
        free: null,
        nonVr: null
    },
    data: function () {
        return {
            games: [],
            loading: false,
            spinning: false,
            deg: 0,
            target: 0,
            empty: false,
            mp3: new Audio('./music/thewheelhausaudio.mp3')
        };
    },
    template: "<div id='gameWheel'>\
                    <div class='gameImageCopy' v-show='value' transition='fadeIn'>\
                        <img :src='value ? value.image : null' :class='{show: value}'>\
                    </div>\
                    <div class='skills-wheel'>\
                        <ul class='wheel' ref='wheel'>\
                            <li v-for='(game, index) in games' :key='index' :ref='index'>\
                                <img id='clipPolygon' :style=\"{backgroundImage: 'url(' + game.image + ')'}\">\
                            </li>\
                        </ul>\
                    </div>\
                    <button class='skills-wheelbtn' title='spin' @click='spin'>{{ loading ? 'Loading' : spinning ? 'Spinning' : empty ? 'No results' : 'Spin' }}</button>\
                </div>",
    methods: {
        $_loadGames: function (callback) {
            this.empty = false;
            this.games = [];

            $.ajax({
                url: this.api + 'apps',
                method: 'get',
                data: {
                    category: this.category,
                    genre: this.genre,
                    tag: Array.isArray(this.tag) ? (this.tag.length ? this.tag : null) : this.tag,
                    free: this.free,
                    non_vr: this.nonVr,
                    username: this.username || null,
                },
                cache: false,
                success: function(games) {
                    this.games = games;

                    this.$nextTick(callback);
                }.bind(this)
            });
        },
        $_spinWheel: function () {
            this.spinning = true;

            this.$emit('input', null);
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
                            $(this.$refs[this.target]).velocity({
                                opacity: 0.4
                            }, {
                                duration: 100,
                                complete: function() {
                                    this.$emit('input', this.games[this.target]);

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

            // Clear previous selected game
            this.$emit('input', null);

            this.$_loadGames(function () {
                this.loading = false;

                if (this.games.length < 1) {
                    this.empty = true;
                } else {
                    this.$_spinWheel();
                }
            }.bind(this));
        },
        $_ordSequential: function () {
            return this.deg + (45 * 3) + 1080;
        },
        $_playSound: function () {
            if (this.enableSound) {
                if (this.mp3.paused)
                    this.mp3.play();
                else
                    this.mp3.pause();
            }
        },
    }
});

var wheel = new Vue({
    el: '#app',
    data: function () {
        return {
            api: 'https://steam.cma.dk/',
            enable_sound: true,
            categories: [],
            genres: [],
            tags: [],
            selectedCategory: null,
            selectedGenre: null,
            selectedTag: [],
            username: null,
            free: 0,
            non_vr: 0,
            winner: null
        };
    },
    mounted: function () {
        this.$_loadCategories();
        this.$_loadGenres();
        this.$_loadTags();
    },
    methods: {
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
        $_loadTags() {
            $.ajax({
                url: this.api + 'tags',
                method: 'get',
                success: function(tags) {
                    tags.sort(this.$_sort);

                    this.tags = tags;

                    var amsifySuggestags = new AmsifySuggestags(this.$refs['tags']);
                    amsifySuggestags._settings({
                        type : 'bootstrap',
                        whiteList: true,
                        suggestions: $.map(tags, function (tag) {
                            return tag.name;
                        }),
                        tagLimit: 5,
                        noSuggestionMsg: 'No Matches',
                        afterAdd: function (value) {
                            this.selectedTag.push(this.$_getTagId(value));
                        }.bind(this),
                        afterRemove: function (value) {
                            this.selectedTag.splice(this.selectedTag.indexOf(this.$_getTagId(value)), 1);
                        }.bind(this)
                    });
                    amsifySuggestags._init();
                }.bind(this)
            });
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
        },
        $_getTagId: function (tagName) {
            return this.tags.find(function (tag) {
                return tag.name === tagName;
            }).id;
        }
    }
});

var footer = new Vue({
    el: '#footer',
    data: function () {
        return {
            date: new Date().getFullYear()
        };
    }
});

// Hide Bootstrap 4 Nav menu onclick
$('.navbar-nav>li>a').on('click', function(){
    $('.navbar-collapse').collapse('hide');
});